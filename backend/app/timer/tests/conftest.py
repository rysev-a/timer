import pytest

from app.serm.cli import SermLoader
from app.serm.services import ProjectService


@pytest.fixture(scope="session")
async def serm_fixtures(db_session):
    loader = SermLoader(db_session)
    await loader.reset()
    yield
    await loader.clear()


@pytest.fixture(scope="session")
async def project_service(db_session) -> ProjectService:
    return ProjectService(db_session)
