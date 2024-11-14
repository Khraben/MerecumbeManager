import React from "react";
import styled, { keyframes } from "styled-components";
import { FaSpinner } from "react-icons/fa";

const Loading = () => {
  return (
    <Overlay>
      <SpinnerContainer>
        <FaSpinnerIcon />
      </SpinnerContainer>
    </Overlay>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1005;
`;

const SpinnerContainer = styled.div`
  margin-left: 80px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const FaSpinnerIcon = styled(FaSpinner)`
  font-size: 50px;
  color: #dddddd;
  animation: ${spin} 2s linear infinite;
`;

export default Loading;