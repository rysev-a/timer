from advanced_alchemy.filters import (
    LimitOffset,
    MultiFilter,
)  # noqa
from sqlalchemy import and_, or_, select  # noqa

from app.serm.models import ProjectModel  # noqa
from app.serm.services import ProjectService


async def test_project_service(
    serm_fixtures, project_service: ProjectService, db_session
):
    project1 = (await project_service.list(LimitOffset(limit=1, offset=0)))[0]
    project2 = (await project_service.list(LimitOffset(limit=1, offset=1)))[0]

    projects_with_current_name_and_description = len(
        await project_service.list(
            MultiFilter(
                {
                    "and_": [
                        {
                            "type": "collection",
                            "field_name": "name",
                            "values": [project1.name],
                        },
                        {
                            "type": "collection",
                            "field_name": "description",
                            "values": [project1.description],
                        },
                    ]
                }
            )
        )
    )
    assert projects_with_current_name_and_description == 1

    projects_with_name_project_1_or_description_project_2 = len(
        await project_service.list(
            MultiFilter(
                {
                    "or_": [
                        {
                            "type": "collection",
                            "field_name": "name",
                            "values": [project1.name],
                        },
                        {
                            "type": "collection",
                            "field_name": "description",
                            "values": [project2.description],
                        },
                    ]
                }
            )
        )
    )
    assert projects_with_name_project_1_or_description_project_2 == 2

    projects_with_current_name_from_one_and_description_from_another = len(
        await project_service.list(
            MultiFilter(
                {
                    "and_": [
                        {
                            "type": "collection",
                            "field_name": "name",
                            "values": [project1.name],
                        },
                        {
                            "type": "collection",
                            "field_name": "description",
                            "values": [project2.description],
                        },
                    ]
                }
            )
        )
    )
    assert projects_with_current_name_from_one_and_description_from_another == 0


async def test_list_and_count_project_service(
    serm_fixtures, project_service: ProjectService, db_session
):
    project1 = (await project_service.list(LimitOffset(limit=1, offset=0)))[0]
    project2 = (await project_service.list(LimitOffset(limit=1, offset=1)))[0]
    _, count = await project_service.list_and_count(
        MultiFilter(
            {
                "or_": [
                    {
                        "type": "collection",
                        "field_name": "name",
                        "values": [project1.name],
                    },
                    {
                        "type": "collection",
                        "field_name": "description",
                        "values": [project2.description],
                    },
                ]
            }
        )
    )

    assert count == 2


async def test_get_project_by_name_start(
    serm_fixtures, project_service: ProjectService, db_session
):
    first_project = (await project_service.list(LimitOffset(limit=1, offset=0)))[0]
    projects = await project_service.list(
        MultiFilter(
            {
                "and_": [
                    {
                        "type": "search",
                        "field_name": "name",
                        "value": first_project.name[0:2],
                    },
                ]
            }
        )
    )
    symbols = set(first_project.name[0:2])

    for project in projects:
        assert symbols.intersection(set(project.name)) == symbols

    # commit session for next tests
    await project_service.repository.session.commit()
