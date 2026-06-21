import requests
import json
from typing import Dict, Any, List
from app.config import settings
from app.db.mongo import get_database
from app.astrology.schemas import BirthData
from bson import ObjectId
import logging
from datetime import datetime
import numpy as np

# optional: sentence-transformers for embeddings
try:
    from sentence_transformers import SentenceTransformer  # type: ignore
except Exception:
    SentenceTransformer = None

# optional: pyswisseph for local transit calculations
try:
    import swisseph as swe  # type: ignore
except Exception:
    swe = None

logger = logging.getLogger(__name__)

class AstrologyService:
    def __init__(self):
        self.api_key = settings.astrology_api_key
        self.base_url = "https://json.freeastrologyapi.com"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
    
    def get_db(self):
        db = get_database()
        if db is None:
            raise Exception("Database not connected")
        return db
    
    def parse_api_response(self, api_responses: Dict[str, Any]) -> List[str]:
        """Parse actual API responses into detailed snippets"""
        snippets = []
        
        logger.info(f"Parsing API responses: {list(api_responses.keys())}")
        
        # Parse planets data
        if "planets" in api_responses:
            planets_data = api_responses["planets"]
            logger.info(f"Planets API response: {json.dumps(planets_data, indent=2)}")
            
            if isinstance(planets_data, dict) and "output" in planets_data:
                for planet in planets_data["output"]:
                    # planets elements may be dicts or raw strings depending on API; guard accordingly
                    if isinstance(planet, dict):
                        name = planet.get("planet", "")
                        sign = planet.get("sign", "")
                        house = planet.get("house", "")
                        degree = planet.get("fullDegree", "")

                        if name and sign and house:
                            snippets.append(f"{name} is positioned in {sign} sign in the {house} house at {degree} degrees")
                        elif name and sign:
                            snippets.append(f"{name} is in {sign} sign")
                    else:
                        # try to decode JSON string or just append the raw text
                        try:
                            parsed = json.loads(planet)
                            if isinstance(parsed, dict):
                                name = parsed.get("planet", "")
                                sign = parsed.get("sign", "")
                                house = parsed.get("house", "")
                                degree = parsed.get("fullDegree", "")
                                if name and sign and house:
                                    snippets.append(f"{name} is positioned in {sign} sign in the {house} house at {degree} degrees")
                                elif name and sign:
                                    snippets.append(f"{name} is in {sign} sign")
                            else:
                                snippets.append(str(parsed))
                        except Exception:
                            snippets.append(str(planet))

                logger.info(f"Extracted {len(snippets)} snippets from planets data")
        
        # Parse extended planets
        if "planets_extended" in api_responses:
            extended_data = api_responses["planets_extended"]
            logger.info(f"Extended planets API response: {json.dumps(extended_data, indent=2)}")
            
            if isinstance(extended_data, dict) and "output" in extended_data:
                for planet in extended_data["output"]:
                    if isinstance(planet, dict):
                        name = planet.get("planet", "")
                        nakshatra = planet.get("nakshatra", "")
                        pada = planet.get("nakshatraPada", "")

                        if name and nakshatra:
                            snippets.append(f"{name} is in {nakshatra} nakshatra, pada {pada}")
                    else:
                        try:
                            parsed = json.loads(planet)
                            if isinstance(parsed, dict):
                                name = parsed.get("planet", "")
                                nakshatra = parsed.get("nakshatra", "")
                                pada = parsed.get("nakshatraPada", "")
                                if name and nakshatra:
                                    snippets.append(f"{name} is in {nakshatra} nakshatra, pada {pada}")
                            else:
                                snippets.append(str(parsed))
                        except Exception:
                            snippets.append(str(planet))

            # Parse transits data (if provided by the API)
            if "transits" in api_responses:
                transits_data = api_responses["transits"]
                logger.info(f"Transits API response: {json.dumps(transits_data, indent=2)}")

                # Expecting a structure containing upcoming transit events
                # Try a couple of possible keys commonly used by astrology APIs
                candidates = []
                if isinstance(transits_data, dict):
                    if "output" in transits_data and isinstance(transits_data["output"], list):
                        candidates = transits_data["output"]
                    elif "transits" in transits_data and isinstance(transits_data["transits"], list):
                        candidates = transits_data["transits"]
                    elif isinstance(transits_data.get("events"), list):
                        candidates = transits_data.get("events", [])

                if isinstance(candidates, list) and candidates:
                    for ev in candidates:
                        # ev may be a dict or a raw string; guard accordingly
                        ev_obj = None
                        if isinstance(ev, dict):
                            ev_obj = ev
                        else:
                            try:
                                parsed = json.loads(ev)
                                if isinstance(parsed, dict):
                                    ev_obj = parsed
                                else:
                                    # not a dict after parsing; treat as raw text
                                    snippets.append(str(parsed))
                                    continue
                            except Exception:
                                snippets.append(str(ev))
                                continue

                        if not ev_obj:
                            continue

                        # Build readable snippet if keys exist
                        planet = ev_obj.get("planet") or ev_obj.get("transiting_planet") or ev_obj.get("body")
                        aspect = ev_obj.get("aspect") or ev_obj.get("type") or ev_obj.get("relation")
                        date = ev_obj.get("date") or ev_obj.get("when") or ev_obj.get("datetime")
                        desc = ev_obj.get("description") or ev_obj.get("note")

                        parts = []
                        if planet:
                            parts.append(str(planet))
                        if aspect:
                            parts.append(str(aspect))
                        if date:
                            parts.append(str(date))

                        if parts:
                            snippet = " ".join(parts)
                            if desc:
                                snippet += f" - {desc}"
                            snippets.append(snippet)
                        else:
                            # Fallback: add raw event as JSON string if meaningful
                            try:
                                snippets.append(json.dumps(ev_obj))
                            except Exception:
                                pass
        
        return snippets
    
    def create_sample_data(self, birth_data: Dict[str, Any]) -> List[str]:
        """Create sample astrology data based on birth details"""
        year = birth_data.get("year", 2007)
        month = birth_data.get("month", 7)
        date = birth_data.get("date", 23)
        
        return [
            f"Sun is positioned in Cancer sign in the 4th house (born {date}/{month}/{year})",
            "Moon is located in Scorpio sign in the 8th house at 15.30 degrees",
            "Mars is placed in Aries sign in the 1st house at 22.45 degrees",
            "Mercury is positioned in Gemini sign in the 3rd house at 8.20 degrees", 
            "Jupiter is located in Sagittarius sign in the 9th house at 28.10 degrees",
            "Venus is placed in Taurus sign in the 2nd house at 12.55 degrees",
            "Saturn is positioned in Capricorn sign in the 10th house at 5.40 degrees",
            "Sun is in Pushya nakshatra, pada 2",
            "Moon is in Anuradha nakshatra, pada 3",
            "Mars is in Ashwini nakshatra, pada 1"
        ]
    
    async def fetch_all_astrology_data(self, user_id: str, birth_data: BirthData) -> bool:
        """Fetch data from FreeAstrologyAPI endpoints"""
        
        try:
            payload = birth_data.model_dump()
            logger.info(f"Fetching astrology data for payload: {payload}")
            # Log headers for debugging (avoid including secrets in logs in production)
            try:
                logger.info(f"Request headers: {json.dumps({k: v for k, v in self.headers.items() if k.lower() != 'x-api-key'})}")
            except Exception:
                logger.debug("Failed to serialize headers for logging")
            
            api_responses = {}
            
            # Try planets endpoint
            try:
                response = requests.post(
                    f"{self.base_url}/planets",
                    headers=self.headers,
                    json=payload,
                    timeout=15
                )
                
                logger.info(f"Planets API status: {response.status_code}")
                # Log full response body for debugging
                try:
                    logger.info(f"Planets API response body: {response.text}")
                except Exception:
                    logger.debug("Could not read planets response text")

                if response.status_code == 200:
                    try:
                        api_responses["planets"] = response.json()
                    except Exception:
                        # If response isn't JSON, store raw text
                        api_responses["planets"] = {"raw": response.text}
                    logger.info("Successfully fetched planets data from API")
                else:
                    logger.warning(f"Planets API failed: {response.status_code} - {response.text}")
                    
            except Exception as e:
                logger.error(f"Planets API call failed: {str(e)}")
            
            # Try extended planets endpoint
            try:
                response = requests.post(
                    f"{self.base_url}/planets/extended",
                    headers=self.headers,
                    json=payload,
                    timeout=15
                )
                
                logger.info(f"Extended planets API status: {response.status_code}")
                # Log full response body for debugging
                try:
                    logger.info(f"Extended planets API response body: {response.text}")
                except Exception:
                    logger.debug("Could not read extended planets response text")

                if response.status_code == 200:
                    try:
                        api_responses["planets_extended"] = response.json()
                    except Exception:
                        api_responses["planets_extended"] = {"raw": response.text}
                    logger.info("Successfully fetched extended planets data from API")
                else:
                    logger.warning(f"Extended planets API failed: {response.status_code}")
                    
            except Exception as e:
                logger.error(f"Extended planets API call failed: {str(e)}")

            # Try transits endpoint (if supported by the API) to get upcoming significant transits
            try:
                response = requests.post(
                    f"{self.base_url}/transits",
                    headers=self.headers,
                    json=payload,
                    timeout=15
                )

                logger.info(f"Transits API status: {response.status_code}")
                # Log full response body for debugging
                try:
                    logger.info(f"Transits API response body: {response.text}")
                except Exception:
                    logger.debug("Could not read transits response text")

                if response.status_code == 200:
                    try:
                        api_responses["transits"] = response.json()
                    except Exception:
                        api_responses["transits"] = {"raw": response.text}
                    logger.info("Successfully fetched transits data from API")
                else:
                    logger.warning(f"Transits API failed: {response.status_code}")

            except Exception as e:
                logger.error(f"Transits API call failed: {str(e)}")
            
            # Parse API responses or use sample data
            if api_responses:
                text_snippets = self.parse_api_response(api_responses)
                logger.info(f"Parsed {len(text_snippets)} snippets from API")
            else:
                text_snippets = self.create_sample_data(payload)
                logger.info(f"Using {len(text_snippets)} sample snippets")
            
            # Ensure we have good data
            if not text_snippets or len(text_snippets) < 3:
                text_snippets = self.create_sample_data(payload)
                logger.info("Fallback to sample data due to insufficient parsed data")
            
            logger.info(f"Final snippets: {text_snippets}")
            # Log the aggregated raw API responses so you can inspect everything called
            try:
                logger.info(f"Aggregated api_responses: {json.dumps(api_responses, indent=2)}")
            except Exception:
                logger.info(f"Aggregated api_responses (non-serializable parts): {str(api_responses)}")
            
            # Compute embeddings if model available (store as list of lists)
            embeddings = None
            if SentenceTransformer:
                try:
                    model = SentenceTransformer("all-MiniLM-L6-v2")
                    vecs = model.encode(text_snippets, convert_to_numpy=True)
                    embeddings = [v.astype(np.float32).tolist() for v in vecs]
                    logger.info("Computed embeddings for %d snippets", len(embeddings))
                except Exception as e:
                    logger.exception("Embedding generation failed: %s", e)
                    embeddings = None

            # If the external API didn't return transit events, try local transit computation
            # to provide concrete upcoming dates (only if swisseph is available)
            if "transits" not in api_responses and swe is not None:
                try:
                    transit_snippets = self.compute_upcoming_transits(payload, years=2)
                    if transit_snippets:
                        logger.info("Computed %d local transit snippets", len(transit_snippets))
                        # append transit snippets to text_snippets
                        text_snippets.extend(transit_snippets)
                        # also expose computed transits in the api_responses so downstream
                        # LLM prompts can see explicit transit dates/strings
                        try:
                            api_responses.setdefault("transits_local", [])
                            # store as simple list of strings
                            api_responses["transits_local"].extend(transit_snippets)
                        except Exception:
                            logger.debug("Could not attach local transit snippets into api_responses")
                except Exception as e:
                    logger.exception("Local transit computation failed: %s", e)

            # Store in MongoDB
            astrology_doc = {
                "user_id": ObjectId(user_id),
                "birth_data": payload,
                "api_responses": api_responses,
                "text_snippets": text_snippets,
                "embeddings": embeddings,
                "created_at": datetime.utcnow()
            }
            
            db = self.get_db()
            # Remove existing data for user
            await db.astrology_data.delete_many({"user_id": ObjectId(user_id)})
            
            # Insert new data
            await db.astrology_data.insert_one(astrology_doc)
            
            logger.info(f"Stored {len(text_snippets)} snippets for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Fetch astrology data error: {str(e)}")
            return False
    
    async def get_user_astrology_data(self, user_id: str) -> List[str]:
        """Get user's astrology text snippets"""
        try:
            db = self.get_db()
            doc = await db.astrology_data.find_one({"user_id": ObjectId(user_id)})

            if doc:
                snippets = doc.get("text_snippets", [])
                embeddings = doc.get("embeddings", None)
                api_responses = doc.get("api_responses", {})
                logger.info(f"Retrieved {len(snippets)} snippets for user {user_id}")
                return {"snippets": snippets, "embeddings": embeddings, "api_responses": api_responses}

            logger.warning(f"No astrology data found for user {user_id}")
            return {"snippets": [], "embeddings": None}
        except Exception as e:
            logger.error(f"Error getting astrology data: {str(e)}")
            return {"snippets": [], "embeddings": None}

    def compute_upcoming_transits(self, birth_payload: Dict[str, Any], years: int = 2) -> List[str]:
        """Compute approximate upcoming transits for Venus and Jupiter conjuncting natal positions.

        This is a lightweight heuristic using pyswisseph (swisseph). It scans day-by-day
        for the next `years` years and records dates where the transiting planet's longitude
        is within 1 degree of the natal planet longitude. Returns readable snippets.
        """
        if swe is None:
            return []

        # Map simple planet names to swisseph constants
        planet_map = {
            'sun': swe.SUN,
            'moon': swe.MOON,
            'mercury': swe.MERCURY,
            'venus': swe.VENUS,
            'mars': swe.MARS,
            'jupiter': swe.JUPITER,
            'saturn': swe.SATURN,
        }

        # Extract natal data
        try:
            y = int(birth_payload.get('year'))
            m = int(birth_payload.get('month'))
            d = int(birth_payload.get('date'))
        except Exception:
            return []

        hour = float(birth_payload.get('hour') or birth_payload.get('hours') or 0)
        minute = float(birth_payload.get('minute') or birth_payload.get('minutes') or 0)
        second = float(birth_payload.get('second') or birth_payload.get('seconds') or 0)
        tz = float(birth_payload.get('timezone') or 0.0)

        local_hours = hour + minute/60.0 + second/3600.0
        ut_hours = local_hours - tz
        jd_natal = swe.julday(y, m, d, ut_hours)

        natal_long = {}
        for name in ('venus', 'jupiter'):
            p = planet_map.get(name)
            if p is None:
                continue
            try:
                lonlat = swe.calc_ut(jd_natal, p)[0]
                natal_long[name] = lonlat[0]
            except Exception:
                continue

        # Scan day-by-day for next `years` years
        today = datetime.utcnow()
        today_jd = swe.julday(today.year, today.month, today.day, 0)
        end_jd = today_jd + years * 365
        found = []

        for jd in range(int(today_jd), int(end_jd)):
            for name, natal_lon in natal_long.items():
                p = planet_map.get(name)
                if p is None:
                    continue
                try:
                    tr = swe.calc_ut(jd, p)[0]
                    tr_lon = tr[0]
                    diff = abs((tr_lon - natal_lon + 180) % 360 - 180)
                    if diff <= 1.0:
                        yy, mm, dd, day_frac = swe.revjul(jd)
                        snippet = f"{name.title()} conjunct natal {name.title()} on {int(dd):02d}/{int(mm):02d}/{int(yy)} (approx)"
                        found.append(snippet)
                except Exception:
                    continue

        # Deduplicate and return
        unique = []
        for s in found:
            if s not in unique:
                unique.append(s)
        return unique[:10]