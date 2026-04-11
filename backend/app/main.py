import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import TaskMessage
from .schemas import TaskMessageCreate, TaskMessageRead, UploadResponse

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / 'uploads'
UPLOAD_ROUTE = '/uploads'

ALLOWED_CONTENT_TYPES = {
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
}

app = FastAPI(title='SpaceFlow Task Chat API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ALLOW_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def ensure_storage_ready():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


ensure_storage_ready()

app.mount(UPLOAD_ROUTE, StaticFiles(directory=UPLOAD_DIR), name='uploads')


def build_file_url(filename: str) -> str:
    return f'{UPLOAD_ROUTE}/{filename}'


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/upload', response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    content_type = (file.content_type or '').lower().strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail='Only PDF and image files are allowed.')

    source_name = file.filename or 'attachment'
    extension = Path(source_name).suffix.lower()
    if not extension:
        if content_type == 'application/pdf':
            extension = '.pdf'
        elif content_type == 'image/png':
            extension = '.png'
        elif content_type in {'image/jpeg', 'image/jpg'}:
            extension = '.jpg'
        elif content_type == 'image/gif':
            extension = '.gif'
        elif content_type == 'image/webp':
            extension = '.webp'
        elif content_type == 'image/bmp':
            extension = '.bmp'
        elif content_type == 'image/svg+xml':
            extension = '.svg'

    filename = f'{uuid4().hex}{extension}'
    target_path = UPLOAD_DIR / filename

    with target_path.open('wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    return UploadResponse(
        file_url=build_file_url(filename),
        file_name=source_name,
        content_type=content_type or 'application/octet-stream',
    )


@app.post('/chat/send', response_model=TaskMessageRead)
def send_chat_message(payload: TaskMessageCreate, db: Session = Depends(get_db)):
    chat_message = TaskMessage(
        task_id=payload.task_id,
        user_name=payload.user_name,
        message=payload.message,
        file_url=payload.file_url,
        file_name=payload.file_name,
        content_type=payload.content_type,
    )
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    return chat_message


@app.get('/chat/{task_id}', response_model=list[TaskMessageRead])
def get_task_chat_messages(task_id: str, db: Session = Depends(get_db)):
    normalized_task_id = task_id.strip()
    if not normalized_task_id:
        raise HTTPException(status_code=400, detail='task_id is required.')

    query = (
        select(TaskMessage)
        .where(TaskMessage.task_id == normalized_task_id)
        .order_by(TaskMessage.created_at.asc(), TaskMessage.id.asc())
    )
    result = db.execute(query)
    return list(result.scalars().all())

