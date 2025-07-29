export const generateSmallestNDigitNumber = (n: number): number => {
  if (n < 1) return 0;
  return Math.pow(10, n - 1);
};

export const generateRandomNumbers = (digit: number, rows: number) => {
  const newNumbers: number[] = [];
  const min = Math.pow(10, digit - 1);
  const max = Math.pow(10, digit) - 1;

  let firstNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  newNumbers.push(firstNumber);
  let sum = firstNumber;

  // Generate remaining numbers
  for (let i = 1; i < rows; i++) {
    let randomNumber: number;
    let attempts = 0;
    
    do {
      const randomPositive = Math.floor(Math.random() * (max - min + 1)) + min;
      const sign = Math.random() < 0.5 ? -1 : 1;
      randomNumber = randomPositive * sign;
      attempts++;
    } while ((sum + randomNumber < min || Math.abs(randomNumber) < min) && attempts < 100);

    sum += randomNumber;
    newNumbers.push(randomNumber);
  }

  return { numbers: newNumbers, answer: sum };
};

export const generateMultiplicationNumbers = (digit1: number, digit2: number) => {
  const min1 = Math.pow(10, digit1 - 1);
  const max1 = Math.pow(10, digit1) - 1;
  const min2 = Math.pow(10, digit2 - 1);
  const max2 = Math.pow(10, digit2) - 1;

  const number1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
  let number2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
  
  if (number2 === 1) number2 = 2;

  return {
    number1,
    number2,
    answer: number1 * number2
  };
};

export const generateDivisionNumbers = (digit1: number, digit2: number) => {
  const min1 = Math.pow(10, digit1 - 1);
  const max1 = Math.pow(10, digit1) - 1;
  const min2 = Math.pow(10, digit2 - 1);
  const max2 = Math.pow(10, digit2) - 1;

  let number1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
  let number2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
  
  if (number2 === 1) number2 = 2;

  // Ensure exact division
  if (number2 > number1) {
    while (number2 % number1 !== 0) {
      number2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
    }
  } else {
    while (number1 % number2 !== 0) {
      number2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
    }
  }

  return {
    number1,
    number2,
    answer: number1 / number2
  };
};
