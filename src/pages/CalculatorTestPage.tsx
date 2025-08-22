import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const CalculatorTestPage = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Calculator Test</h1>
        
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          {/* Display */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="text-right text-3xl font-mono font-semibold text-foreground min-h-[48px] flex items-center justify-end">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={clear}
            >
              C
            </Button>
            <Button variant="outline" className="h-12 text-lg" disabled>±</Button>
            <Button variant="outline" className="h-12 text-lg" disabled>%</Button>
            <Button 
              variant="default" 
              className="h-12 text-lg"
              onClick={() => inputOperation('÷')}
            >
              ÷
            </Button>

            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('7')}
            >
              7
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('8')}
            >
              8
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('9')}
            >
              9
            </Button>
            <Button 
              variant="default" 
              className="h-12 text-lg"
              onClick={() => inputOperation('×')}
            >
              ×
            </Button>

            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('4')}
            >
              4
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('5')}
            >
              5
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('6')}
            >
              6
            </Button>
            <Button 
              variant="default" 
              className="h-12 text-lg"
              onClick={() => inputOperation('-')}
            >
              -
            </Button>

            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('1')}
            >
              1
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('2')}
            >
              2
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('3')}
            >
              3
            </Button>
            <Button 
              variant="default" 
              className="h-12 text-lg"
              onClick={() => inputOperation('+')}
            >
              +
            </Button>

            <Button 
              variant="outline" 
              className="h-12 text-lg col-span-2"
              onClick={() => inputNumber('0')}
            >
              0
            </Button>
            <Button 
              variant="outline" 
              className="h-12 text-lg"
              onClick={() => inputNumber('.')}
            >
              .
            </Button>
            <Button 
              variant="default" 
              className="h-12 text-lg bg-primary hover:bg-primary/90"
              onClick={performCalculation}
            >
              =
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTestPage;