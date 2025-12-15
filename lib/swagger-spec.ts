export const openApiSpec = {
    "openapi": "3.0.0",
    "info": {
        "title": "Prompt Manager API",
        "version": "1.0.0",
        "description": "API for managing and executing AI Prompts."
    },
    "servers": [
        {
            "url": "/api",
            "description": "Internal API"
        }
    ],
    "components": {
        "securitySchemes": {
            "ApiKeyAuth": {
                "type": "apiKey",
                "in": "header",
                "name": "x-api-key"
            }
        }
    },
    "security": [
        {
            "ApiKeyAuth": []
        }
    ],
    "paths": {
        "/prompts": {
            "get": {
                "summary": "List all prompts",
                "tags": ["Prompts"],
                "responses": {
                    "200": {
                        "description": "List of prompts",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "id": { "type": "string" },
                                            "name": { "type": "string" },
                                            "updatedAt": { "type": "string", "format": "date-time" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/gateway": {
            "post": {
                "summary": "LLM Gateway",
                "tags": ["Gateway"],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "model": { "type": "string", "example": "gpt-4o" },
                                    "messages": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "role": { "type": "string" },
                                                "content": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "AI Completion"
                    }
                }
            }
        },
        "/models": {
            "get": {
                "summary": "List available models",
                "tags": ["Utilities"],
                "responses": {
                    "200": {
                        "description": "List of models"
                    }
                }
            }
        }
    }
};
