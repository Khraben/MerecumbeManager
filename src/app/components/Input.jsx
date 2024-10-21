import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  outline: none;
  background: transparent;
  transition: all 0.3s ease-in-out;

  &:focus {
    border-color: #0b0f8b;
    transform: scale(1.05);
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    transform: translateY(-1.5rem);
    font-size: 0.75rem;
    color: #0b0f8b;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  background: transparent;
  transition: all 0.3s ease-in-out;
  appearance: none;

  &:focus {
    border-color: #0b0f8b;
    transform: scale(1.05);
  }

  &:focus + label,
  &:not([value=""]) + label {
    transform: translateY(-1.5rem);
    font-size: 0.75rem;
    color: #0b0f8b;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }

  option {
    padding: 10px;
    background: #fff;
    transition: background 0.3s ease-in-out;
  }

  option:hover {
    background: #f0f0f0;
  }
`;

const StyledLabel = styled.label`
  position: absolute;
  top: 0.75rem;
  left: 1rem;
  color: #aaa;
  transition: all 0.3s ease-in-out;
  pointer-events: none;

  ${({ hasValue }) => hasValue && `
    transform: translateY(-1.5rem);
    font-size: 0.75rem;
    color: #0b0f8b;
  `}
`;

const ComboBoxComponent = ({ placeholder, value, ...props }) => (
  <InputContainer>
    <StyledSelect value={value} {...props}>
      <option value="" disabled hidden></option>
      {props.children}
    </StyledSelect>
    <StyledLabel htmlFor={props.id} hasValue={value}>{placeholder}</StyledLabel>
  </InputContainer>
);

const Input = ({ type, id, className, placeholder, ...props }) => (
  <InputContainer className={className}>
    <StyledInput type={type} id={id} placeholder=" " {...props} />
    <StyledLabel htmlFor={id}>{placeholder}</StyledLabel>
  </InputContainer>
);

const SelectInput = ({ id, className, children, placeholder, value, ...props }) => (
  <InputContainer className={className}>
    <StyledSelect id={id} value={value} {...props}>
      <option value="" disabled hidden></option>
      {children}
    </StyledSelect>
    <StyledLabel htmlFor={id} hasValue={value}>{placeholder}</StyledLabel>
  </InputContainer>
);

const DateInputComponent = (props) => <Input type="date" {...props} />;
const TimeInputComponent = (props) => <Input type="time" {...props} />;

const generateTimeOptions = (startHour, endHour, interval) => {
  const times = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const period = hour < 12 ? "am" : "pm";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const time = `${displayHour}:${minute === 0 ? "00" : minute}${period}`;
      times.push(time);
    }
  }
  return times;
};

const TimeRangeInputComponent = ({ startHour, endHour, interval, value, onChange, placeholder }) => (
  <InputContainer>
    <StyledSelect value={value} onChange={onChange}>
      <option value="" disabled hidden></option>
      {generateTimeOptions(startHour, endHour, interval).map((time, index) => (
        <option key={index} value={time}>{time}</option>
      ))}
    </StyledSelect>
    <StyledLabel htmlFor={placeholder} hasValue={value}>{placeholder}</StyledLabel>
  </InputContainer>
);

export const TextInput = (props) => <Input type="text" {...props} />;
export const NumberInput = (props) => <Input type="number" {...props} />;
export const ComboBox = ComboBoxComponent;
export const Select = SelectInput;
export const DateInput = DateInputComponent;
export const TimeInput = TimeInputComponent;
export const TimeRangeInput = TimeRangeInputComponent;

export default Input;