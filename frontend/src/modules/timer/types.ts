export interface AthleteType {
  id: string;
  name: string;
}

export interface LapType {
  id: string;
  count: number;
  time: number;
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
