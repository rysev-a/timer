import asyncio
from collections.abc import AsyncIterator

from advanced_alchemy.base import UUIDAuditBase
from litestar import Litestar
from litestar.testing import AsyncTestClient
import pytest
import sqlalchemy
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from lab.settings import settings

pytest_plugins = ["lab.auth.tests.auth_fixtures"]


@pytest.fixture(scope="session")
def event_loop():
    return asyncio.get_event_loop()


@pytest.fixture(scope="function")
async def test_client() -> AsyncIterator[AsyncTestClient[Litestar]]:
    async with AsyncTestClient(app=app) as client:
        yield client


@pytest.fixture(scope="session")
async def db_session() -> AsyncSession:
    engine = create_async_engine(url=settings.database_uri)

    metadata = UUIDAuditBase.registry.metadata
    async with engine.begin() as conn:
        await conn.run_sync(metadata.drop_all)
        await conn.run_sync(metadata.create_all)

    # create async engine
    async with async_sessionmaker(engine, expire_on_commit=False)() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

    # clear database
    async with engine.begin() as conn:
        meta = sqlalchemy.MetaData()
        await conn.run_sync(meta.reflect)
        await conn.run_sync(meta.drop_all)
