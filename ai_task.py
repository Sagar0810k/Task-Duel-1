import random

# Sample list of productive tasks
TASK_LIST = [
    "Read a chapter of a book.",
    "Go for a 30-minute walk.",
    "Learn a new programming concept.",
    "Write a journal entry.",
    "Meditate for 10 minutes.",
]

def generate_ai_task():
    return random.choice(TASK_LIST)