export interface AthleteType {
  id: string;
  name: string;
}

export interface LapType {
  race_id: string;
  athlete_id: string;
  id: string;
  count: number;
  start_time: string;
  end_time: string;
}

export interface RaceType {
  id: string;
  name: string;
  athletes: AthleteType[];
}

export interface AthleteRaceType {
  id: string;
  athlete: AthleteType;
  race: RaceType;
  laps: LapType[];
}
