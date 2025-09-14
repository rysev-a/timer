from advanced_alchemy.service import SQLAlchemyAsyncRepositoryService
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.timer.models import RaceModel, AthleteModel, LapModel, RaceAthleteModel

from .repositories import (
    RaceAthleteRepository,
    RaceRepository,
    AthleteRepository,
    LapRepository,
)
import uuid
from typing import Iterable


class RaceService(SQLAlchemyAsyncRepositoryService[RaceModel, RaceRepository]):
    repository_type = RaceRepository

    async def update_race_athletes(
        self, item_id: uuid.UUID, athletes: Iterable[str | uuid.UUID]
    ):
        race = await self.get(item_id)
        athlete_repository = AthleteRepository(session=self.repository.session)

        race.athletes = await athlete_repository.list(AthleteModel.id.in_(athletes))
        self.repository.session.add(race)
        await self.repository.session.commit()


async def provide_race_service(db_session: AsyncSession) -> RaceService:
    return RaceService(session=db_session)


class AthleteService(SQLAlchemyAsyncRepositoryService[AthleteModel, AthleteRepository]):
    repository_type = AthleteRepository


async def provide_athlete_service(db_session: AsyncSession) -> AthleteService:
    return AthleteService(session=db_session)


class LapService(SQLAlchemyAsyncRepositoryService[LapModel, LapRepository]):
    repository_type = LapRepository


async def provide_lap_service(db_session: AsyncSession) -> LapService:
    return LapService(session=db_session)


class RaceAthleteService(
    SQLAlchemyAsyncRepositoryService[RaceAthleteModel, RaceAthleteRepository]
):
    repository_type = RaceAthleteRepository


async def provide_race_athlete_service(db_session: AsyncSession) -> RaceAthleteService:
    return RaceAthleteService(session=db_session)
