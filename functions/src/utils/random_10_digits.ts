export function getRandom10DigitNumber(): string {
    const otp: string = (() =>
      "" +
      [...Array(10)]
        .map(() => "123456789"[Math.floor(Math.random() * 9)])
        .join(""))();
    return otp;
  }
  