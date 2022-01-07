import { detailedTableLogic } from './detailedTableLogic';
import { chartLogic } from './chartLogic';

export function stats() {
  detailedTableLogic('day');
  chartLogic();
}
