from typing import Annotated, Optional, List
from uuid import UUID

from advanced_alchemy.extensions.litestar.dto import SQLAlchemyDTO
from advanced_alchemy.extensions.litestar.providers import (
    FilterConfig,
    create_service_dependencies,
)
from advanced_alchemy.filters import FilterTypes
from advanced_alchemy.service import OffsetPagination
from litestar import get, patch, post, delete
from litestar.controller import Controller
from litestar.dto import DTOConfig
from litestar.params import Dependency
import msgspec


from ..models import RaceAthleteModel

from ..services import RaceAthleteService


class CreateRaceAthleteRequest(msgspec.Struct, omit_defaults=True):
    race_id: UUID
    athlete_id: UUID





class RaceAthleteDTO(SQLAlchemyDTO[RaceAthleteModel]):
    config = DTOConfig(
        max_nested_depth=1,
    )


class RaceAthleteController(Controller):
    path = "/races-athletes"


    dependencies = {
        **create_service_dependencies(
            RaceAthleteService,
            key="service",
            filters=FilterConfig(
                id_filter=UUID,
                created_at=True,
                updated_at=True,
                pagination_type="limit_offset",
                search="name",
            ),
        ),
    }

    return_dto = RaceAthleteDTO

    @get(operation_id="ListRaceAthletes", path="/", exclude_from_auth=True)
    async def list_item(
        self,
        service: RaceAthleteService,
        filters: Annotated[list[FilterTypes], Dependency(skip_validation=True)],
    ) -> OffsetPagination[RaceAthleteModel]:
        results, total = await service.list_and_count(*filters)
        return service.to_schema(data=results, total=total, filters=filters)





    @post(operation_id="CreateRaceAthlete", path="/")
    async def create_item(
        self, data: CreateRaceAthleteRequest, service: RaceAthleteService
    ) -> RaceAthleteModel:


        return await service.create(
            RaceAthleteModel(
                race_id=data.race_id,
                athlete_id=data.athlete_id,
            )
        )
