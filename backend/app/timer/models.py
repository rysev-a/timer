from uuid import UUID

from advanced_alchemy.base import UUIDAuditBase
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime


class RaceModel(UUIDAuditBase):
    __tablename__ = "races"

    name: Mapped[str] = mapped_column(unique=True, nullable=False)

    athletes = relationship(
        "AthleteModel",
        secondary="races_athletes",
        lazy="selectin",
    )


class AthleteModel(UUIDAuditBase):
    __tablename__ = "athletes"

    name: Mapped[str] = mapped_column(unique=True, nullable=False)


class RaceAthleteModel(UUIDAuditBase):
    __tablename__ = "races_athletes"

    race_id: Mapped[UUID] = mapped_column(
        ForeignKey("races.id", ondelete="CASCADE"), primary_key=True
    )
    athlete_id: Mapped[UUID] = mapped_column(
        ForeignKey("athletes.id"), primary_key=True
    )


class LapModel(UUIDAuditBase):
    __tablename__ = "laps"

    race_id: Mapped[UUID] = mapped_column(
        ForeignKey("races.id", ondelete="CASCADE"), primary_key=True
    )
    athlete_id: Mapped[UUID] = mapped_column(
        ForeignKey("athletes.id"), primary_key=True
    )
    count: Mapped[int]
    start_time: Mapped[datetime] = mapped_column(nullable=False)
    end_time: Mapped[datetime] = mapped_column(nullable=True)
