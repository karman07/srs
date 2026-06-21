from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class BirthData(BaseModel):
    year: int
    month: int
    date: int
    hours: int
    minutes: int
    seconds: int = 0
    latitude: float
    longitude: float
    timezone: float
    config: Dict[str, str] = {"ayanamsha": "lahiri"}

class AstrologyQuery(BaseModel):
    question: str
    raw: bool = False

class AstrologyDataResponse(BaseModel):
    message: str
    data_fetched: bool

class QueryResponse(BaseModel):
    answer: str
    sources_used: int