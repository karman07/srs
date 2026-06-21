from typing import List, Dict, Any
import json

class AstrologyDataParser:
    """Parse astrology API responses into structured text snippets"""
    
    @staticmethod
    def parse_planets_data(data: Dict[str, Any]) -> List[str]:
        """Parse basic planets data into text snippets"""
        snippets = []
        
        try:
            if isinstance(data, dict) and "output" in data:
                for planet_data in data["output"]:
                    planet = planet_data.get("planet", "")
                    sign = planet_data.get("sign", "")
                    house = planet_data.get("house", "")
                    degree = planet_data.get("fullDegree", "")
                    
                    if planet and sign:
                        snippets.append(f"{planet} is positioned in {sign} sign at {degree} degrees")
                    if planet and house:
                        snippets.append(f"{planet} is located in the {house} house")
        except Exception as e:
            print(f"Error parsing planets data: {e}")
        
        return snippets
    
    @staticmethod
    def parse_extended_planets(data: Dict[str, Any]) -> List[str]:
        """Parse extended planets data"""
        snippets = []
        
        try:
            if isinstance(data, dict) and "output" in data:
                for planet_data in data["output"]:
                    planet = planet_data.get("planet", "")
                    nakshatra = planet_data.get("nakshatra", "")
                    pada = planet_data.get("nakshatraPada", "")
                    
                    if planet and nakshatra:
                        snippets.append(f"{planet} is in {nakshatra} nakshatra")
                    if planet and pada:
                        snippets.append(f"{planet} is in pada {pada} of its nakshatra")
        except Exception as e:
            print(f"Error parsing extended planets: {e}")
        
        return snippets
    
    @staticmethod
    def parse_chart_info(data: Dict[str, Any], chart_type: str) -> List[str]:
        """Parse D10 or Navamsa chart information"""
        snippets = []
        
        try:
            if isinstance(data, dict) and "output" in data:
                for planet_data in data["output"]:
                    planet = planet_data.get("planet", "")
                    sign = planet_data.get("sign", "")
                    house = planet_data.get("house", "")
                    
                    if planet and sign:
                        snippets.append(f"In {chart_type} chart: {planet} is in {sign} sign")
                    if planet and house:
                        snippets.append(f"In {chart_type} chart: {planet} is in {house} house")
        except Exception as e:
            print(f"Error parsing {chart_type} chart: {e}")
        
        return snippets
    
    @staticmethod
    def parse_dasa_info(data: Dict[str, Any]) -> List[str]:
        """Parse Vimsottari dasa information"""
        snippets = []
        
        try:
            if isinstance(data, dict) and "output" in data:
                current_dasa = data["output"].get("currentMahaDasa", {})
                if current_dasa:
                    planet = current_dasa.get("planet", "")
                    start = current_dasa.get("start", "")
                    end = current_dasa.get("end", "")
                    
                    if planet:
                        snippets.append(f"Current Maha Dasa is of {planet}")
                    if start and end:
                        snippets.append(f"Current Maha Dasa period: {start} to {end}")
                
                current_antar = data["output"].get("currentAntarDasa", {})
                if current_antar:
                    planet = current_antar.get("planet", "")
                    if planet:
                        snippets.append(f"Current Antar Dasa is of {planet}")
        except Exception as e:
            print(f"Error parsing dasa info: {e}")
        
        return snippets
    
    @staticmethod
    def parse_all_data(api_responses: Dict[str, Any]) -> List[str]:
        """Parse all API responses into text snippets"""
        all_snippets = []
        
        try:
            # Parse planets data
            if "planets" in api_responses and api_responses["planets"]:
                snippets = AstrologyDataParser.parse_planets_data(api_responses["planets"])
                all_snippets.extend(snippets)
            
            # Parse extended planets
            if "planets_extended" in api_responses and api_responses["planets_extended"]:
                snippets = AstrologyDataParser.parse_extended_planets(api_responses["planets_extended"])
                all_snippets.extend(snippets)
            
            # Parse D10 chart
            if "d10_chart" in api_responses and api_responses["d10_chart"]:
                snippets = AstrologyDataParser.parse_chart_info(api_responses["d10_chart"], "D10")
                all_snippets.extend(snippets)
            
            # Parse Navamsa chart
            if "navamsa_chart" in api_responses and api_responses["navamsa_chart"]:
                snippets = AstrologyDataParser.parse_chart_info(api_responses["navamsa_chart"], "Navamsa")
                all_snippets.extend(snippets)
            
            # Parse dasa information
            if "dasa_info" in api_responses and api_responses["dasa_info"]:
                snippets = AstrologyDataParser.parse_dasa_info(api_responses["dasa_info"])
                all_snippets.extend(snippets)
            
            # Parse maha antar dasas
            if "maha_antar_dasas" in api_responses and api_responses["maha_antar_dasas"]:
                snippets = AstrologyDataParser.parse_dasa_info(api_responses["maha_antar_dasas"])
                all_snippets.extend(snippets)
                
        except Exception as e:
            print(f"Error in parse_all_data: {e}")
        
        return all_snippets if all_snippets else ["Astrology data processed successfully"]