import React, { useContext } from "react";
import "./loader.css";
import LoaderContext from "./LoaderContext";

const Loader = () => {
  const { isLoading } = useContext(LoaderContext);
  if (isLoading) {
    return (
      <div className="loader__wrapper">
        <div className="sprint-loader">
          <div className="man">
            <div className="head"></div>
            <div className="body"></div>
            <div className="arm front"></div>
            <div className="arm back"></div>
            <div className="leg front"></div>
            <div className="leg back"></div>
          </div>
          <div className="road"></div>
        </div>
        <div className="loading-text">Momentum Sprinting...</div>
      </div>
    );
  }
};

export default Loader;
