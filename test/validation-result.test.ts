import ValidationResult from '../src/validation-result';

describe('#isValid', () => {
  it('is true if validation is valid', () => {
    const result = new ValidationResult(2 > 1, '1 is not greater than 2');
    expect(result.isValid).toBeTruthy();
  });

  it('is false if validation is invalid', () => {
    const result = new ValidationResult(1 > 2, '1 is not greater than 2');
    expect(result.isValid).toBeFalsy();
  });
});

describe('#isInvalid', () => {
  it('is false if validation is valid', () => {
    const result = new ValidationResult(2 > 1, '1 is not greater than 2');
    expect(result.isInvalid).toBeFalsy();
  });

  it('is true if validation is valid', () => {
    const result = new ValidationResult(1 > 2, '1 is not greater than 2');
    expect(result.isInvalid).toBeTruthy();
  });
});