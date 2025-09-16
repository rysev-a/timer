from datetime import datetime
from typing import Annotated
from uuid import UUID

from advanced_alchemy.extensions.litestar.dto import SQLAlchemyDTO
from advanced_alchemy.extensions.litestar.providers import (
    FilterConfig,
    create_service_dependencies,
)
from advanced_alchemy.filters import FilterTypes
from advanced_alchemy.service import OffsetPagination
from litestar import get, patch, post
from litestar.controller import Controller
from litestar.dto import DTOConfig
from litestar.params import Dependency
import msgspec


from ..models import LapModel

from ..services import LapService


class CreateLapRequest(msgspec.Struct, omit_defaults=True):
    athlete_id: UUID
    race_id: UUID
    count: int
    start_time: datetime


class PatchLapRequest(msgspec.Struct, omit_defaults=True):
    race_athlete_id: UUID
    end_time: datetime


class LapDTO(SQLAlchemyDTO[LapModel]):
    config = DTOConfig(
        max_nested_depth=1,
    )


class LapController(Controller):
    path = "/laps"

    dependencies = {
        **create_service_dependencies(
            LapService,
            key="service",
            filters=FilterConfig(
                id_filter=UUID,
                created_at=True,
                updated_at=True,
                pagination_type="limit_offset",
                pagination_size=10000,
                search="name",
            ),
        ),
    }

    return_dto = LapDTO

    @get(operation_id="ListLaps", path="/", exclude_from_auth=True)
    async def list_item(
        self,
        service: LapService,
        filters: Annotated[list[FilterTypes], Dependency(skip_validation=True)],
    ) -> OffsetPagination[LapModel]:
        results, total = await service.list_and_count(*filters)
        return service.to_schema(data=results, total=total, filters=filters)

    @patch(operation_id="UpdateLap", path="/{item_id:str}")
    async def update_lap(
        self,
        item_id: UUID,
        service: LapService,
        data: PatchLapRequest,
    ) -> LapModel:
        data = msgspec.to_builtins(data)

        return await service.update(LapModel(id=item_id, **data), auto_commit=True)

    @post(operation_id="CreateLap", path="/")
    async def create_item(
        self, data: CreateLapRequest, service: LapService
    ) -> LapModel:
        from datetime import datetime


        return await service.create(
            LapModel(
                count=data.count,
                start_time=data.start_time,
                race_id=data.race_id,
                athlete_id=data.athlete_id,
            )
        )
