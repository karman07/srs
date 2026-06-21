from typing import List
import re
import os
import logging
import json
import requests
import time
import asyncio

logger = logging.getLogger("llm")

# Helper redaction utilities to avoid leaking API keys or secrets into logs
def _redact_value(val: str) -> str:
    if not isinstance(val, str):
        return val
    gkey = os.getenv("GOOGLE_API_KEY", "")
    if gkey and gkey in val:
        val = val.replace(gkey, "[REDACTED_GOOGLE_API_KEY]")
    # redact long opaque tokens (heuristic)
    val = re.sub(r"\b[A-Za-z0-9-_]{20,}\b", "[REDACTED]", val)
    return val

def _redact_api_responses(obj) -> str:
    try:
        s = json.dumps(obj)
    except Exception:
        s = str(obj)
    # redact common secret keys
    s = re.sub(r'("?(api_key|access_token|private_key|secret|authorization)"?\s*:\s*)"[^"]+"', r"\1\"[REDACTED]\"", s, flags=re.IGNORECASE)
    s = _redact_value(s)
    return s

try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
except Exception:
    pipeline = None
    torch = None

# Optional official Google client for Generative AI (preferred if available)
# Try both common client packages/import paths: `google.generativeai` and `from google import genai`.
genai = None
try:
    import google.generativeai as genai  # type: ignore
except Exception:
    try:
        # Some client variants expose 'genai' under the 'google' package
        from google import genai  # type: ignore
    except Exception:
        genai = None


class LLMService:
    """Enhanced astrology response generator with optional local HF model.

    Behavior:
    - If environment variable `USE_LOCAL_LLM` is set to a truthy value and a
      Hugging Face model is available (via `LOCAL_LLM_MODEL`), the service will
      use the model to synthesize answers from retrieved docs.
    - Otherwise it falls back to a rule-based synthesizer (existing logic).
    """

    def __init__(self):
        # Default to enabling local LLM unless explicitly turned off via env
        self.use_local = os.getenv("USE_LOCAL_LLM", "true").lower() in ("1", "true", "yes")
        # Default lightweight free HF model suitable for local usage
        self.local_model_name = os.getenv("LOCAL_LLM_MODEL", "google/flan-t5-small")
        self.local_pipe = None

        # Optional Google generative LLM (Gemini) support
        self.use_google = os.getenv("USE_GOOGLE_LLM", "false").lower() in ("1", "true", "yes")
        self.google_model_name = os.getenv("GOOGLE_LLM_MODEL", "gemini-2.0-flash")
        self.google_api_key = os.getenv("GOOGLE_API_KEY", "")
        if self.use_local:
            if pipeline is None:
                logger.warning("Transformers pipeline or torch not available; local LLM cannot be loaded.")
            else:
                try:
                    device = 0 if torch is not None and torch.cuda.is_available() else -1
                    # Use text2text-generation for seq2seq models (Flan-T5 family)
                    self.local_pipe = pipeline("text2text-generation", model=self.local_model_name, device=device)
                    logger.info("Loaded local LLM model: %s (device=%s)", self.local_model_name, device)
                except Exception as e:
                    logger.exception("Failed to load local LLM model %s: %s", self.local_model_name, e)
                    self.local_pipe = None

    def _call_google_llm(self, prompt: str) -> str:
        """Call Google's Generative Language API (Gemini) with a safety-first robust parser.

        Returns the text output or an empty string on failure. Does not log the API key.
        """
        if not self.google_api_key:
            logger.warning("GOOGLE_API_KEY not set; cannot call Google LLM")
            return ""

        model = self.google_model_name

        # Prefer the official client library if available — it's more robust with auth and payload shapes.
        if genai is not None:
            try:
                # Configure the client with the API key (reads from env or explicit value)
                try:
                    genai.configure(api_key=self.google_api_key)
                except Exception:
                    # Some older/newer versions may use a different configure method; ignore failures here
                    pass

                logger.info("Calling Google LLM via official client model=%s", model)
                # Try the newer genai.Client() pattern first (e.g., `from google import genai` / genai.Client())
                try:
                    if hasattr(genai, "Client"):
                        try:
                            client = genai.Client()  # many client variants accept no-arg constructor
                            if hasattr(client, "models"):
                                models = getattr(client, "models")
                                # Preferred: models.generate_content(model=..., contents=...)
                                if hasattr(models, "generate_content"):
                                    logger.debug("Using genai.Client.models.generate_content for model=%s", model)
                                    try:
                                        resp = models.generate_content(model=model, contents=prompt)
                                    except TypeError:
                                        # some variants expect a list of contents
                                        resp = models.generate_content(model=model, contents=[prompt])

                                    # Try to extract text from common response shapes
                                    try:
                                        # If the response is an object with attributes
                                        if hasattr(resp, "text"):
                                            return getattr(resp, "text")
                                        if hasattr(resp, "content"):
                                            return getattr(resp, "content")
                                        # Dict-like
                                        if isinstance(resp, dict):
                                            if "candidates" in resp and resp["candidates"]:
                                                c = resp["candidates"][0]
                                                return c.get("content") or c.get("text") or json.dumps(c)
                                            if "output" in resp and isinstance(resp["output"], list) and resp["output"]:
                                                return resp["output"][0].get("content", json.dumps(resp["output"][0]))
                                            if "result" in resp and isinstance(resp["result"], dict):
                                                return json.dumps(resp["result"])
                                            return json.dumps(resp)
                                        # Fallback to string
                                        return str(resp)
                                    except Exception:
                                        return str(resp)

                        except Exception as e:
                            logger.exception("genai.Client() / models.generate_content failed, falling back: %s", e)

                    # Try common client entrypoints (generate, chat.create) as earlier
                    if hasattr(genai, "generate"):
                        resp = genai.generate(model=model, prompt=prompt)
                        # Attempt to extract text from common response shapes
                        if isinstance(resp, dict):
                            # check for candidates / output fields
                            if "candidates" in resp and resp["candidates"]:
                                first = resp["candidates"][0]
                                return first.get("content") or first.get("text") or json.dumps(first)
                            if "output" in resp and isinstance(resp["output"], list) and resp["output"]:
                                return resp["output"][0].get("content", json.dumps(resp["output"][0]))
                            # fallback to stringifying
                            return json.dumps(resp)
                        # If not a dict, stringify
                        return str(resp)
                    if hasattr(genai, "chat") and hasattr(genai.chat, "create"):
                        chat_resp = genai.chat.create(model=model, messages=[{"role": "user", "content": prompt}])
                        # Try to parse known response shapes
                        if isinstance(chat_resp, dict):
                            if "candidates" in chat_resp and chat_resp["candidates"]:
                                return chat_resp["candidates"][0].get("content", json.dumps(chat_resp["candidates"][0]))
                            if "output" in chat_resp and isinstance(chat_resp["output"], list) and chat_resp["output"]:
                                return chat_resp["output"][0].get("content", json.dumps(chat_resp["output"][0]))
                        return str(chat_resp)
                except Exception as e:
                    logger.exception("google client call raised, falling back to REST: %s", e)
            except Exception:
                logger.debug("Failed to use google.generativeai client; will try REST fallback")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        # Some examples (and Google's docs) use the x-goog-api-key header instead of ?key= param.
        params = {}
        request_headers = {"Content-Type": "application/json"}
        if self.google_api_key:
            # prefer header auth when calling the generateContent endpoint
            request_headers["x-goog-api-key"] = self.google_api_key

        # Try multiple payload shapes because different Gemini endpoints expect different JSON shapes.
        candidate_payloads = [
            ("prompt_text", {"prompt": {"text": prompt}}),
            ("input_text", {"input": prompt}),
            ("messages", {"messages": [{"author": "user", "content": [{"type": "text", "text": prompt}]}]}),
            ("instances", {"instances": [{"text": prompt}]}),
            # New style payload used by the generateContent endpoint (contents -> parts -> text)
            ("generate_content_parts", {"contents": [{"parts": [{"text": prompt}]}]})
        ]

        last_resp_text = ""
        for name, payload in candidate_payloads:
            # Log the request payload shape being attempted (do NOT log the API key).
            try:
                logger.info("Calling Google LLM model=%s payload_shape=%s prompt_len=%d", model, name, len(prompt))
                logger.debug("Google LLM request payload preview (%s): %s", name, json.dumps({k: (v if k != 'prompt' else '[prompt]') for k, v in payload.items()})[:2000])
            except Exception:
                logger.debug("Failed to log Google LLM request preview for %s", name)

            start = time.time()
            try:
                resp = requests.post(url, params=params, json=payload, timeout=60)
                elapsed = time.time() - start
                logger.info("Google LLM status: %s payload_shape=%s elapsed=%.2fs", resp.status_code, name, elapsed)
                try:
                    hdrs = {k: v for k, v in resp.headers.items()}
                    logger.debug("Google LLM response headers: %s", json.dumps(hdrs))
                except Exception:
                    logger.debug("Could not serialize response headers for %s", name)

                try:
                    body_text = resp.text
                    last_resp_text = body_text
                    logger.info("Google LLM response text (truncated 4000 chars) for %s: %s", name, body_text[:4000])
                except Exception:
                    logger.debug("Could not read Google response text for %s", name)

                # If we got a 200, try parsing JSON and return
                if resp.status_code == 200:
                    try:
                        j = resp.json()
                    except Exception:
                        logger.debug("Google LLM returned non-JSON response for %s", name)
                        return resp.text
                    # success: return parsed or stringified JSON
                    return json.dumps(j) if not isinstance(j, str) else j
                else:
                    # Log the error and try next payload shape
                    logger.warning("Google LLM payload_shape=%s returned status=%s; trying next shape", name, resp.status_code)
                    # keep last_resp_text for final return if all fail
                    continue
            except Exception as e:
                elapsed = time.time() - start
                logger.exception("Google LLM call failed for payload_shape=%s after %.2fs: %s", name, elapsed, e)
                continue

        # If none of the payload shapes worked, return the last response text or empty
        return last_resp_text or ""

    def _extract_dates(self, texts: List[str]) -> List[str]:
        date_pattern = re.compile(r'(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4})', re.IGNORECASE)
        found = set()
        for t in texts:
            for m in date_pattern.findall(t):
                found.add(m.strip())
        return sorted(found)

    def _build_system_prompt(self, question: str, retrieved_docs: List[str]) -> str:
        docs_text = "\n".join([f"- {d}" for d in retrieved_docs[:20]])
        prompt = (
            "You are an expert Vedic astrologer AI. Use only the factual astrology data provided below "
            "to answer the user's question. Explain your reasoning step by step and cite which snippets you used.\n\n"
            "RETRIEVED DATA:\n"
            f"{docs_text}\n\n"
            "USER QUESTION:\n"
            f"{question}\n\n"
            "Answer succinctly but thoroughly. If the data does not contain an answer, say so and suggest what additional data is needed."
        )
        return prompt

    def _call_local_llm(self, prompt: str) -> str:
        if not self.local_pipe:
            return ""
        try:
            # Use the pipeline to generate text (seq2seq models expect short inputs)
            out = self.local_pipe(prompt, max_length=512, do_sample=False)
            if isinstance(out, list) and out:
                return out[0].get("generated_text", out[0].get("text", "")).strip()
            return str(out)
        except Exception as e:
            logger.exception("Local LLM generation failed: %s", e)
            return ""

    async def generate_astrology_response(self, question: str, retrieved_docs: List[str], api_responses: dict = None, raw_mode: bool = False) -> str:
        """Generate detailed astrology response using retrieved data.

        If a local HF model is configured and loaded, use it to synthesize the
        response. Otherwise fall back to the rule-based generator below.
        """

        if not retrieved_docs:
            return "I don't have enough astrology data to answer your question. Please fetch your birth chart data first."

        # Log retrieved docs and raw api responses for debugging
        logger.info("LLMService: retrieved_docs_count=%d raw_mode=%s", len(retrieved_docs), raw_mode)
        logger.debug("LLMService: retrieved_docs preview=%s", retrieved_docs[:5])
        if api_responses is not None:
            try:
                logger.debug("LLMService: api_responses=%s", json.dumps(api_responses)[:1000])
            except Exception:
                logger.debug("LLMService: api_responses (non-serializable)")

        # If raw_mode requested, prefer concise extraction and exact answers
        if raw_mode:
            # If Google LLM is enabled, prefer it for strict raw responses
            if self.use_google and api_responses:
                raw_json = json.dumps(api_responses, indent=2)
                prompt = (
                    "You are an expert Vedic astrologer. Use ONLY the raw JSON data provided. "
                    "Do NOT add interpretations beyond what the data contains. If the user asks for a specific date/time, return exact dates/times found in the data in ISO format or DD/MM/YYYY HH:MM. "
                    "If multiple dates exist, list them. If no exact dates are present, say 'no exact date available'.\n\n"
                    f"RAW_API_JSON:\n{raw_json}\n\nQUESTION:\n{question}\n"
                )
                # Log prompt and input data (redacted) to the file-based llm logger
                try:
                    logger.info("LLM_PROMPT_LOG request_id=%s user_id=%s prompt_len=%d", "n/a", "n/a", len(prompt))
                    logger.info("LLM_PROMPT_PROMPT: %s", _redact_value(prompt)[:20000])
                    logger.info("LLM_PROMPT_API_RESPONSES: %s", _redact_api_responses(api_responses)[:20000])
                    logger.info("LLM_PROMPT_RETRIEVED_DOCS: %s", _redact_api_responses(retrieved_docs)[:20000])
                except Exception:
                    logger.exception("Failed to write prompt log")

                llm_out = await asyncio.to_thread(self._call_google_llm, prompt)
                if llm_out:
                    return llm_out

            # If local model available, let it synthesize strictly from raw API JSON
            if self.local_pipe and api_responses:
                raw_json = json.dumps(api_responses, indent=2)
                prompt = (
                    "You are an expert Vedic astrologer. Use ONLY the raw JSON data provided. "
                    "Do NOT add interpretations beyond what the data contains. If the user asks for a specific date/time, return exact dates/times found in the data in ISO format or DD/MM/YYYY HH:MM. "
                    "If multiple dates exist, list them. If no exact dates are present, say 'no exact date available'.\n\n"
                    f"RAW_API_JSON:\n{raw_json}\n\nQUESTION:\n{question}\n"
                )
                try:
                    logger.info("LLM_PROMPT_LOG request_id=%s user_id=%s prompt_len=%d", "n/a", "n/a", len(prompt))
                    logger.info("LLM_PROMPT_PROMPT: %s", _redact_value(prompt)[:20000])
                    logger.info("LLM_PROMPT_API_RESPONSES: %s", _redact_api_responses(api_responses)[:20000])
                    logger.info("LLM_PROMPT_RETRIEVED_DOCS: %s", _redact_api_responses(retrieved_docs)[:20000])
                except Exception:
                    logger.exception("Failed to write prompt log")

                llm_out = await asyncio.to_thread(self._call_local_llm, prompt)
                if llm_out:
                    return llm_out

            # Fallback: extract date-like strings from api_responses and retrieved_docs and return them raw
            combined_texts = []
            if api_responses:
                try:
                    combined_texts.append(json.dumps(api_responses))
                except Exception:
                    combined_texts.append(str(api_responses))
            combined_texts.extend(retrieved_docs)
            dates = self._extract_dates(combined_texts)
            if dates:
                return "\n".join(dates)
            # If nothing found, return raw api JSON as last resort
            if api_responses:
                try:
                    return json.dumps(api_responses)
                except Exception:
                    return str(api_responses)
            return "no exact date available"

        # Use Google Gemini exclusively if configured. Do NOT fall back to local or rule-based generators.
        if self.use_google:
            # Build a strict prompt that includes both raw API JSON and retrieved snippets
            api_json = "" if api_responses is None else json.dumps(api_responses, indent=2)
            docs_text = "\n".join([f"- {d}" for d in retrieved_docs[:50]])

            # Extract any explicit date-like strings from api_responses and retrieved_docs
            # and include them as a distinct section to encourage the LLM to use exact dates.
            dates_section = ""
            try:
                combined_texts = []
                if api_responses:
                    try:
                        combined_texts.append(json.dumps(api_responses))
                    except Exception:
                        combined_texts.append(str(api_responses))
                combined_texts.extend(retrieved_docs)
                found_dates = self._extract_dates(combined_texts)
                if found_dates:
                    dates_section = "\n\nEXACT_DATES_FOUND_IN_DATA:\n" + "\n".join(found_dates) + "\n\n"
            except Exception:
                dates_section = ""
            prompt = (
                "You are an expert Vedic astrologer. Use ONLY the data provided below (do not hallucinate).\n\n"
                "RAW_API_JSON:\n"
                f"{api_json}\n\n"
                "RETRIEVED_SNIPPETS:\n"
                f"{docs_text}\n\n"
                "USER QUESTION:\n"
                f"{question}\n\n"
                f"{dates_section}"
                "Instructions:\n"
                "1) Answer using ONLY the information provided in RAW_API_JSON and RETRIEVED_SNIPPETS.\n"
                "2) If exact dates/times are present, return them in ISO 8601 format or DD/MM/YYYY HH:MM.\n"
                "3) If you perform any computation, show the steps and state the precision (day/hour/minute).\n"
                "4) Return a JSON object with keys: 'answer' (string) and 'sources_used' (integer).\n"
            )

            # Log prompt and input data (redacted) to the file-based llm logger
            try:
                logger.info("LLM_PROMPT_LOG request_id=%s user_id=%s prompt_len=%d", "n/a", "n/a", len(prompt))
                logger.info("LLM_PROMPT_PROMPT: %s", _redact_value(prompt)[:20000])
                logger.info("LLM_PROMPT_API_RESPONSES: %s", _redact_api_responses(api_responses)[:20000])
                logger.info("LLM_PROMPT_RETRIEVED_DOCS: %s", _redact_api_responses(retrieved_docs)[:20000])
            except Exception:
                logger.exception("Failed to write prompt log")

            llm_out = await asyncio.to_thread(self._call_google_llm, prompt)
            if llm_out:
                # If the model returned JSON, try to pass it through; otherwise wrap the text
                try:
                    parsed = json.loads(llm_out)
                    # Ensure it has answer and sources_used
                    if isinstance(parsed, dict) and "answer" in parsed:
                        return json.dumps(parsed)
                except Exception:
                    # Not JSON — return raw model text
                    return llm_out

            # If Gemini was configured but returned nothing or failed, return an error (no fallback)
            return (
                "Google Gemini is enabled but did not return a usable response. "
                "Please check GOOGLE_API_KEY, network access, or model availability."
            )

        # If Google is not configured, do not automatically use any other model — instruct the operator
        return (
            "No LLM provider configured. To use Gemini, set USE_GOOGLE_LLM=true and provide GOOGLE_API_KEY. "
            "If you prefer a local HF model instead, set USE_LOCAL_LLM=true and install transformers/torch."
        )
        question_lower = question.lower()
        
                # Career-related analysis
        if any(word in question_lower for word in ['career', 'job', 'work', 'profession', 'business']):
            career_planets = []
            house_10_planets = []
            house_2_planets = []  # Money house
            house_6_planets = []  # Work environment
            
            for doc in retrieved_docs:
                doc_lower = doc.lower()
                if any(planet in doc_lower for planet in ['mars', 'saturn', 'sun', 'jupiter']):
                    career_planets.append(doc)
                if '10th house' in doc_lower:
                    house_10_planets.append(doc)
                if '2nd house' in doc_lower:
                    house_2_planets.append(doc)
                if '6th house' in doc_lower:
                    house_6_planets.append(doc)
            
            if career_planets or house_10_planets:
                response = "**Detailed Career Analysis from Your Birth Chart:**\n\n"
                
                # Main career significators
                if career_planets:
                    response += "**Key Planetary Influences:**\n"
                    for planet in career_planets[:3]:
                        if 'sun' in planet.lower():
                            response += f"• {planet}\n  - This indicates your core professional identity and potential for recognition\n  - Suggests areas where you can shine and show leadership\n"
                        if 'saturn' in planet.lower():
                            response += f"• {planet}\n  - Represents your career structure and long-term professional growth\n  - Shows areas where you'll gain expertise through dedication\n"
                        if 'jupiter' in planet.lower():
                            response += f"• {planet}\n  - Indicates areas of career expansion and opportunities\n  - Shows potential for growth and advancement\n"
                        if 'mars' in planet.lower():
                            response += f"• {planet}\n  - Shows your professional drive and competitive spirit\n  - Indicates how you pursue your goals\n"
                
                # Career House Analysis
                if house_10_planets:
                    response += "\n**10th House Analysis (Career & Public Status):**\n"
                    response += f"• Planetary positions: {' '.join(house_10_planets)}\n"
                    response += "• This house reveals your career path, public reputation, and professional achievements\n"
                
                # Work Environment
                if house_6_planets:
                    response += "\n**6th House Analysis (Work Environment & Skills):**\n"
                    response += f"• Influences: {' '.join(house_6_planets)}\n"
                    response += "• Shows your work style, daily responsibilities, and relationship with colleagues\n"
                
                # Financial Potential
                if house_2_planets:
                    response += "\n**2nd House Analysis (Income & Resources):**\n"
                    response += f"• Placements: {' '.join(house_2_planets)}\n"
                    response += "• Indicates your earning potential and financial stability\n"
                
                # Career Timing
                if any('saturn' in doc.lower() for doc in career_planets):
                    response += "\n**Career Timing & Development:**\n"
                    response += "• Major career developments often align with Saturn cycles\n"
                    response += "• Focus on building solid foundations in your chosen field\n"
                    response += "• Patience and persistence will be key to your success\n"
                
                # Professional Strengths
                response += "\n**Professional Strengths & Potential:**\n"
                for planet in career_planets:
                    if 'sun' in planet.lower():
                        response += "• Natural leadership abilities and potential for authority positions\n"
                    if 'jupiter' in planet.lower():
                        response += "• Good opportunities for growth and expansion in your career\n"
                    if 'mars' in planet.lower():
                        response += "• Strong initiative and ability to take decisive action\n"
                    if 'saturn' in planet.lower():
                        response += "• Excellent organizational and management capabilities\n"
                
                return response
        
        # Personality analysis
        if any(word in question_lower for word in ['personality', 'character', 'nature', 'traits']):
            personality_planets = []
            for doc in retrieved_docs:
                if any(planet in doc.lower() for planet in ['sun', 'moon', 'ascendant', '1st house', 'mercury']):
                    personality_planets.append(doc)
            
            if personality_planets:
                response = "**Personality Analysis from Your Birth Chart:**\n\n"
                response += f"Your core personality is shaped by: {' '.join(personality_planets[:3])}\n\n"
                response += "**Key Personality Traits:**\n"
                response += "• Sun placement reveals your core identity and ego expression\n"
                response += "• Moon position shows your emotional nature and instincts\n"
                response += "• 1st house planets indicate how others perceive you\n"
                response += "• Mercury's placement affects your communication style and thinking patterns"
                return response
        
        # Relationship analysis (expanded)
        if any(word in question_lower for word in ['relationship', 'love', 'marriage', 'partner']):
            relationship_planets = []
            venus = []
            seventh = []
            mars_docs = []
            moon_docs = []
            jupiter_docs = []

            for doc in retrieved_docs:
                doc_lower = doc.lower()
                if any(planet in doc_lower for planet in ['venus', '7th house', 'mars', 'moon', 'jupiter']):
                    relationship_planets.append(doc)
                if 'venus' in doc_lower:
                    venus.append(doc)
                if '7th house' in doc_lower:
                    seventh.append(doc)
                if 'mars' in doc_lower:
                    mars_docs.append(doc)
                if 'moon' in doc_lower:
                    moon_docs.append(doc)
                if 'jupiter' in doc_lower:
                    jupiter_docs.append(doc)

            if relationship_planets:
                response = "**Detailed Relationship & Love Analysis:**\n\n"

                # Planet-by-planet interpretations
                if venus:
                    response += "**Venus (Love & Attraction):**\n"
                    for v in venus[:2]:
                        response += f"• {v}\n  - This describes your romantic style, what you find attractive, and how you express affection.\n"
                    response += "\n"

                if seventh:
                    response += "**7th House (Partnerships & Marriage):**\n"
                    response += f"• Placements: {' '.join(seventh)}\n  - Indicates the type of partner you attract and your long-term partnership themes.\n\n"

                if mars_docs:
                    response += "**Mars (Passion & Sexuality):**\n"
                    for m in mars_docs[:2]:
                        response += f"• {m}\n  - Shows how you initiate in relationships and your drive in romantic pursuits.\n"
                    response += "\n"

                if moon_docs:
                    response += "**Moon (Emotional Needs):**\n"
                    for mo in moon_docs[:2]:
                        response += f"• {mo}\n  - Reveals needs for emotional security, closeness, and how you nurture a partner.\n"
                    response += "\n"

                if jupiter_docs:
                    response += "**Jupiter (Growth in Relationships):**\n"
                    response += f"• Placements: {' '.join(jupiter_docs[:2])}\n  - Suggests opportunities for expansion, learning, and fortunate timing in love.\n\n"

                # Synthesis: timing & actionable guidance
                response += "**Timing & Likely Phases:**\n"
                if any('jupiter' in d.lower() for d in relationship_planets):
                    response += "• Jupiter-related periods often bring opportunities for meeting significant people and expanding your social circle.\n"
                if any('saturn' in d.lower() for d in retrieved_docs):
                    response += "• Saturn influences can bring long-term, serious commitments but often after a period of testing or growth.\n"
                # If Venus or Moon prominent, hint at sooner emotional connections
                if venus or moon_docs:
                    response += "• With strong Venus/Moon placements, emotional and romantic connections may form more naturally and sooner.\n"

                response += "\n**Practical Guidance:**\n"
                response += "• Strengthen social routines and attend group activities aligned with your Jupiter/9th-house interests to increase meeting chances.\n"
                response += "• Work on emotional openness (Moon) and clear communication of needs (Venus/Mercury) to attract stable partnerships.\n"
                response += "• If Saturn themes appear, be patient—build trust gradually and prioritize long-term compatibility.\n"

                response += "\n**Sources (key placements used):**\n"
                response += '\n'.join([f"- {d}" for d in relationship_planets[:5]])

                # Extract any explicit date/time-like strings from the retrieved snippets
                date_pattern = re.compile(r'(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4})', re.IGNORECASE)
                found_dates = set()
                for text in relationship_planets + retrieved_docs:
                    for m in date_pattern.findall(text):
                        found_dates.add(m.strip())

                if found_dates:
                    response += "\n**Estimated Dates / Timings (from transit data):**\n"
                    for d in sorted(found_dates):
                        response += f"• {d}\n"

                return response
        
        # Education analysis
        if any(word in question_lower for word in ['education', 'study', 'learning', 'knowledge']):
            education_planets = []
            for doc in retrieved_docs:
                if any(planet in doc.lower() for planet in ['mercury', '5th house', 'jupiter', '9th house']):
                    education_planets.append(doc)
            
            if education_planets:
                response = "**Educational Analysis from Your Birth Chart:**\n\n"
                response += f"Your learning path is indicated by: {' '.join(education_planets[:3])}\n\n"
                response += "**Educational Insights:**\n"
                response += "• Mercury placement shows your learning style and intellectual abilities\n"
                response += "• 5th house planets indicate creative learning and academic performance\n"
                response += "• Jupiter's position reveals higher education and wisdom acquisition\n"
                response += "• 9th house planets show philosophical learning and advanced studies"
                return response
        
        # General comprehensive analysis
        response = "**Comprehensive Birth Chart Analysis:**\n\n"
        response += f"Your birth chart reveals: {' '.join(retrieved_docs[:4])}\n\n"
        response += "**Key Astrological Insights:**\n"
        response += "• Each planetary placement contributes to different aspects of your personality\n"
        response += "• The houses show which life areas are most emphasized in your chart\n"
        response += "• Nakshatra positions provide deeper insights into your karmic patterns\n"
        response += "• The combination of signs, houses, and nakshatras creates your unique astrological profile\n\n"
        response += "For more specific guidance, ask about particular areas like career, relationships, personality, or education."
        
        return response