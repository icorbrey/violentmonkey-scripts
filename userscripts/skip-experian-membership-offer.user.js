// ==UserScript==
// @name        Skip Experian Membership Offer
// @description Automatically skips the membership offer when logging into Experian.
// @author      Isaac Corbrey
// @namespace   Violentmonkey Scripts
// @match       https://usa.experian.com/member/loginInterstitial
// @grant       none
// @version     1.0
// ==/UserScript==

window.location.replace('https://usa.experian.com/member/unifiedalerts/all?filter=selected&sort=sort')
