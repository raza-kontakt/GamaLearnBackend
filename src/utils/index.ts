import { Request } from 'express';

export const getLang = (req: Request) => {
  const lang = req.query?.lang || 'en';

  return lang;
};

export const getRandomNumber = <T extends number>(max: T): number => {
  return Math.random() * max;
};

export const getFiftyFifty = (): boolean => {
  return Math.random() < 0.5;
};
