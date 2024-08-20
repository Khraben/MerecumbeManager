import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'; //estilos generales para la app

// Estilos globales
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Arial', sans-serif;
    background-color: #fafafa;
    color: #333;
  }

  h1, h2 {
    font-family: 'Segoe UI', sans-serif;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #282c34;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Title>Academia de Baile</Title>
        <Subtitle>Gestión de clases y horarios</Subtitle>
      </Wrapper>
    </>
  );
}

export default App;