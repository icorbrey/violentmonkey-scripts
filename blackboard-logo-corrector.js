// ==UserScript==
// @name        Blackboard Logo Corrector
// @description Forces the Blackboard logo to open in the same tab.
// @author      Isaac Corbrey
// @namespace   Violentmonkey Scripts
// @match       https://blackboard.indianatech.edu/*
// @grant       none
// @version     1.0
// /==UserScript==

document
  .querySelector('.brandingImgWrap > a')
  .removeAttribute('target')
