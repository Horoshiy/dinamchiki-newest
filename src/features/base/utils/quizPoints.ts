// Баллы квиза — numeric(8,2): «87», «65,25», «43,5». Не округляем до целых.
export function fmtQuizPoints(p: number): string {
  return p.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')
}