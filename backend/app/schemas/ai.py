from pydantic import BaseModel, Field

class GenerateSummaryRequest(BaseModel):
    dataset_id: int

class GenerateSummaryResponse(BaseModel):
    summary: str
    metrics_used: dict

class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str

class ChatRequest(BaseModel):
    dataset_id: int
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str