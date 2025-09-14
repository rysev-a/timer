from advanced_alchemy.repository import SQLAlchemyAsyncRepository

from .models import RaceModel, AthleteModel, RaceAthleteModel, LapModel


class RaceRepository(SQLAlchemyAsyncRepository[RaceModel]):
    model_type = RaceModel

class AthleteRepository(SQLAlchemyAsyncRepository[AthleteModel]):
    model_type = AthleteModel

class LapRepository(SQLAlchemyAsyncRepository[LapModel]):
    model_type = LapModel

class RaceAthleteRepository(SQLAlchemyAsyncRepository[RaceAthleteModel]):
    model_type = RaceAthleteModel
