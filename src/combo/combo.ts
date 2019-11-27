import { Character } from "../melee/characters";
import { ComboType, GameStartType } from "slp-parser-js";
import { MatchesPlayerName, ExcludesChainGrabs, ExcludesWobbles, SatisfiesMinComboPercent, ExcludesLargeSingleHit, ExcludesCPUs, IsOneVsOne } from "./criteria";

export interface ComboFilterSettings {
  chainGrabbers: Character[];
  nameTags: string[];
  minComboPercent: number;
  excludeCPUs: boolean;
  excludeChainGrabs: boolean;
  excludeWobbles: boolean;
  largeHitThreshold: number; // The proportion of damage that a hit has to do to be considered a large hit
  wobbleThreshold: number; // The number of pummels before it's considered a wobble
  chainGrabThreshold: number; // proportion of up throw / pummels to other moves to be considered a chain grab
  perCharacterMinComboPercent: { [characterId: number]: number };
}

export interface Criteria {
  check: (combo: ComboType, settings: GameStartType, options: ComboFilterSettings) => boolean;
}

const defaultOptions: ComboFilterSettings = {
  chainGrabbers: [Character.MARTH, Character.PEACH, Character.PIKACHU, Character.DR_MARIO],
  nameTags: [],
  minComboPercent: 60,
  excludeCPUs: true,
  excludeChainGrabs: true,
  excludeWobbles: true,
  largeHitThreshold: 0.8,
  wobbleThreshold: 8,
  chainGrabThreshold: 0.8,
  perCharacterMinComboPercent: {
    [Character.JIGGLYPUFF]: 85,
  },
}

export class ComboFilter {
  private options: ComboFilterSettings;
  private criteria: Criteria[];

  public constructor(options?: Partial<ComboFilterSettings>) {
    this.options = Object.assign({}, defaultOptions, options);
    this.criteria = new Array<Criteria>();
    this.criteria.push(
      new MatchesPlayerName(),
      new ExcludesChainGrabs(),
      new ExcludesWobbles(),
      new SatisfiesMinComboPercent(),
      new ExcludesLargeSingleHit(),
      new ExcludesCPUs(),
      new IsOneVsOne(),
    );
  }

  public updateSettings(options: Partial<ComboFilterSettings>): void {
    this.options = Object.assign({}, this.options, options);
  }

  public getSettings(): ComboFilterSettings {
    return this.options;
  }

  public resetSettings(): void {
    this.options = Object.assign({}, defaultOptions);
  }

  public isCombo(combo: ComboType, settings: GameStartType): boolean {
    // Check if we satisfy all the criteria
    this.criteria.forEach((c) => {
      if (!c.check(combo, settings, this.options)) {
        return false;
      }
    });

    // If the combo killed then it's a valid combo
    return combo.didKill;
  }
}
