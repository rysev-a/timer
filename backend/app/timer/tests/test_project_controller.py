import urllib.parse
from urllib.parse import urlencode

from litestar import Litestar
from litestar.testing import AsyncTestClient

from app.serm.models import ProjectModel
from app.serm.services import ProjectService


async def test_get_projects(
    test_client: AsyncTestClient[Litestar], serm_fixtures, admin_headers
):
    projects = await test_client.get("/api/serm/projects/", headers=admin_headers)
    assert projects.json().get("total") > 0


async def test_get_projects_by_description(
    test_client: AsyncTestClient[Litestar],
    serm_fixtures,
    project_service: ProjectService,
    admin_headers,
):
    projects = await project_service.list()
    project = projects[0]
    projects = await test_client.get(
        f"/api/serm/projects/?searchString={urllib.parse.quote_plus(project.description)}",
        headers=admin_headers,
    )
    assert projects.json().get("total") == 1


async def test_projects_by_name_and_description(
    test_client: AsyncTestClient[Litestar],
    serm_fixtures,
    project_service: ProjectService,
    admin_headers,
):
    projects = await project_service.list()
    project = projects[0]

    search_string = urlencode(
        dict(name=project.name[0:4], description=project.description[0:4])
    )
    projects = await test_client.get(
        f"/api/serm/projects/?{search_string}", headers=admin_headers
    )
    assert projects.json().get("items")[0].get("name") == project.name


async def test_remove_project(
    test_client: AsyncTestClient[Litestar],
    project_service: ProjectService,
    serm_fixtures,
    admin_headers,
):
    new_project = await project_service.create(
        ProjectModel(name="new project"), auto_commit=True
    )
    await project_service.list()
    prev_count = len(await project_service.list())

    await test_client.delete(
        f"/api/serm/projects/{new_project.id}", headers=admin_headers
    )
    assert len(await project_service.list()) == prev_count - 1


async def test_create_project(
    test_client: AsyncTestClient[Litestar],
    project_service: ProjectService,
    serm_fixtures,
    admin_headers,
):
    new_project_response = await test_client.post(
        "/api/serm/projects",
        json={"name": "new project", "description": "new project description"},
        headers=admin_headers,
    )
    new_project = await project_service.get(new_project_response.json().get("id"))
    assert new_project.name == "new project"
    assert new_project.description == "new project description"

    # teardown
    await project_service.delete(new_project.id)


async def test_update_project(
    test_client: AsyncTestClient[Litestar],
    project_service: ProjectService,
    serm_fixtures,
    admin_headers,
):
    project_to_update = await project_service.create(
        ProjectModel(name="new project"), auto_commit=True
    )

    await test_client.patch(
        f"/api/serm/projects/{project_to_update.id}",
        json={"name": "updated project", "description": "updated project description"},
        headers=admin_headers,
    )
    await project_service.repository.session.refresh(project_to_update)

    assert project_to_update.name == "updated project"
    assert project_to_update.description == "updated project description"

    # teardown
    await project_service.delete(project_to_update.id)
