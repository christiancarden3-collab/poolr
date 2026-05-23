'use client'

import { useState, useEffect, useCallback } from 'react'

// Roland Garros 2026 fixtures by matchday (TEST)
function getRGMatches(matchday) {
  const rgMatchesByDay = {
    1: [ // Sunday May 24 - R16
      { id: 'rg-r16-1', matchday: 1, stage: 'R16', homeTeam: { name: 'Carlos Alcaraz', flag: 'es' }, awayTeam: { name: 'Holger Rune', flag: 'dk' }, date: 'May 24', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'rg-r16-2', matchday: 1, stage: 'R16', homeTeam: { name: 'Jannik Sinner', flag: 'it' }, awayTeam: { name: 'Ben Shelton', flag: 'us' }, date: 'May 24', time: '1:00 PM ET', status: 'scheduled' },
      { id: 'rg-r16-3', matchday: 1, stage: 'R16', homeTeam: { name: 'Novak Djokovic', flag: 'rs' }, awayTeam: { name: 'Alex de Minaur', flag: 'au' }, date: 'May 24', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'rg-r16-4', matchday: 1, stage: 'R16', homeTeam: { name: 'Daniil Medvedev', flag: 'ru' }, awayTeam: { name: 'Taylor Fritz', flag: 'us' }, date: 'May 24', time: '5:00 PM ET', status: 'scheduled' },
    ],
    2: [ // Monday May 25 - R16
      { id: 'rg-r16-5', matchday: 2, stage: 'R16', homeTeam: { name: 'Alexander Zverev', flag: 'de' }, awayTeam: { name: 'Casper Ruud', flag: 'no' }, date: 'May 25', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'rg-r16-6', matchday: 2, stage: 'R16', homeTeam: { name: 'Stefanos Tsitsipas', flag: 'gr' }, awayTeam: { name: 'Hubert Hurkacz', flag: 'pl' }, date: 'May 25', time: '1:00 PM ET', status: 'scheduled' },
      { id: 'rg-r16-7', matchday: 2, stage: 'R16', homeTeam: { name: 'Andrey Rublev', flag: 'ru' }, awayTeam: { name: 'Frances Tiafoe', flag: 'us' }, date: 'May 25', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'rg-r16-8', matchday: 2, stage: 'R16', homeTeam: { name: 'Tommy Paul', flag: 'us' }, awayTeam: { name: 'Lorenzo Musetti', flag: 'it' }, date: 'May 25', time: '5:00 PM ET', status: 'scheduled' },
    ],
    3: [ // Tuesday May 26 - QF
      { id: 'rg-qf-1', matchday: 3, stage: 'QF', homeTeam: { name: 'Alcaraz/Sinner', flag: 'xx' }, awayTeam: { name: 'Djokovic/Medvedev', flag: 'xx' }, date: 'May 26', time: '12:00 PM ET', status: 'scheduled' },
      { id: 'rg-qf-2', matchday: 3, stage: 'QF', homeTeam: { name: 'Zverev/Tsitsipas', flag: 'xx' }, awayTeam: { name: 'Rublev/Paul', flag: 'xx' }, date: 'May 26', time: '3:00 PM ET', status: 'scheduled' },
    ],
    4: [ // Thursday May 28 - SF
      { id: 'rg-sf-1', matchday: 4, stage: 'SF', homeTeam: { name: 'TBD', flag: 'xx' }, awayTeam: { name: 'TBD', flag: 'xx' }, date: 'May 28', time: '12:00 PM ET', status: 'scheduled' },
      { id: 'rg-sf-2', matchday: 4, stage: 'SF', homeTeam: { name: 'TBD', flag: 'xx' }, awayTeam: { name: 'TBD', flag: 'xx' }, date: 'May 28', time: '3:00 PM ET', status: 'scheduled' },
    ],
    5: [ // Sunday May 31 - Final
      { id: 'rg-final', matchday: 5, stage: 'F', homeTeam: { name: 'TBD', flag: 'xx' }, awayTeam: { name: 'TBD', flag: 'xx' }, date: 'May 31', time: '9:00 AM ET', status: 'scheduled' },
    ],
  }
  return rgMatchesByDay[matchday] || []
}

// Real World Cup 2026 fixtures by matchday
function getDemoMatches(matchday) {
  const realMatchesByDay = {
    1: [
      { id: 'md1-1', matchday: 1, stage: 'group', group: 'A', homeTeam: { name: 'Mexico', flag: 'mx' }, awayTeam: { name: 'South Africa', flag: 'za' }, date: 'Jun 11', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-2', matchday: 1, stage: 'group', group: 'A', homeTeam: { name: 'Korea Republic', flag: 'kr' }, awayTeam: { name: 'Czechia', flag: 'cz' }, date: 'Jun 11', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-3', matchday: 1, stage: 'group', group: 'B', homeTeam: { name: 'Canada', flag: 'ca' }, awayTeam: { name: 'Bosnia and Herzegovina', flag: 'ba' }, date: 'Jun 12', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-4', matchday: 1, stage: 'group', group: 'D', homeTeam: { name: 'USA', flag: 'us' }, awayTeam: { name: 'Paraguay', flag: 'py' }, date: 'Jun 12', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-5', matchday: 1, stage: 'group', group: 'C', homeTeam: { name: 'Haiti', flag: 'ht' }, awayTeam: { name: 'Scotland', flag: 'gb-sct' }, date: 'Jun 13', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'md1-6', matchday: 1, stage: 'group', group: 'D', homeTeam: { name: 'Australia', flag: 'au' }, awayTeam: { name: 'Türkiye', flag: 'tr' }, date: 'Jun 13', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-7', matchday: 1, stage: 'group', group: 'C', homeTeam: { name: 'Brazil', flag: 'br' }, awayTeam: { name: 'Morocco', flag: 'ma' }, date: 'Jun 13', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-8', matchday: 1, stage: 'group', group: 'B', homeTeam: { name: 'Qatar', flag: 'qa' }, awayTeam: { name: 'Switzerland', flag: 'ch' }, date: 'Jun 13', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-9', matchday: 1, stage: 'group', group: 'E', homeTeam: { name: "Côte d'Ivoire", flag: 'ci' }, awayTeam: { name: 'Ecuador', flag: 'ec' }, date: 'Jun 14', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'md1-10', matchday: 1, stage: 'group', group: 'E', homeTeam: { name: 'Germany', flag: 'de' }, awayTeam: { name: 'Curaçao', flag: 'cw' }, date: 'Jun 14', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-11', matchday: 1, stage: 'group', group: 'F', homeTeam: { name: 'Netherlands', flag: 'nl' }, awayTeam: { name: 'Japan', flag: 'jp' }, date: 'Jun 14', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-12', matchday: 1, stage: 'group', group: 'F', homeTeam: { name: 'Sweden', flag: 'se' }, awayTeam: { name: 'Tunisia', flag: 'tn' }, date: 'Jun 14', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-13', matchday: 1, stage: 'group', group: 'H', homeTeam: { name: 'Saudi Arabia', flag: 'sa' }, awayTeam: { name: 'Uruguay', flag: 'uy' }, date: 'Jun 15', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'md1-14', matchday: 1, stage: 'group', group: 'H', homeTeam: { name: 'Spain', flag: 'es' }, awayTeam: { name: 'Cabo Verde', flag: 'cv' }, date: 'Jun 15', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-15', matchday: 1, stage: 'group', group: 'G', homeTeam: { name: 'IR Iran', flag: 'ir' }, awayTeam: { name: 'New Zealand', flag: 'nz' }, date: 'Jun 15', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-16', matchday: 1, stage: 'group', group: 'G', homeTeam: { name: 'Belgium', flag: 'be' }, awayTeam: { name: 'Egypt', flag: 'eg' }, date: 'Jun 15', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-17', matchday: 1, stage: 'group', group: 'I', homeTeam: { name: 'France', flag: 'fr' }, awayTeam: { name: 'Senegal', flag: 'sn' }, date: 'Jun 16', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'md1-18', matchday: 1, stage: 'group', group: 'I', homeTeam: { name: 'Iraq', flag: 'iq' }, awayTeam: { name: 'Norway', flag: 'no' }, date: 'Jun 16', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-19', matchday: 1, stage: 'group', group: 'J', homeTeam: { name: 'Argentina', flag: 'ar' }, awayTeam: { name: 'Algeria', flag: 'dz' }, date: 'Jun 16', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-20', matchday: 1, stage: 'group', group: 'J', homeTeam: { name: 'Austria', flag: 'at' }, awayTeam: { name: 'Jordan', flag: 'jo' }, date: 'Jun 16', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md1-21', matchday: 1, stage: 'group', group: 'L', homeTeam: { name: 'Ghana', flag: 'gh' }, awayTeam: { name: 'Panama', flag: 'pa' }, date: 'Jun 17', time: '11:00 AM ET', status: 'scheduled' },
      { id: 'md1-22', matchday: 1, stage: 'group', group: 'L', homeTeam: { name: 'England', flag: 'gb-eng' }, awayTeam: { name: 'Croatia', flag: 'hr' }, date: 'Jun 17', time: '2:00 PM ET', status: 'scheduled' },
      { id: 'md1-23', matchday: 1, stage: 'group', group: 'K', homeTeam: { name: 'Portugal', flag: 'pt' }, awayTeam: { name: 'Congo DR', flag: 'cd' }, date: 'Jun 17', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md1-24', matchday: 1, stage: 'group', group: 'K', homeTeam: { name: 'Uzbekistan', flag: 'uz' }, awayTeam: { name: 'Colombia', flag: 'co' }, date: 'Jun 17', time: '8:00 PM ET', status: 'scheduled' },
    ],
    2: [
      // Jun 18
      { id: 'md2-1', matchday: 2, stage: 'group', group: 'A', homeTeam: { name: 'Czechia', flag: 'cz' }, awayTeam: { name: 'South Africa', flag: 'za' }, date: 'Jun 18', time: '12:00 PM ET', status: 'scheduled' },
      { id: 'md2-2', matchday: 2, stage: 'group', group: 'B', homeTeam: { name: 'Switzerland', flag: 'ch' }, awayTeam: { name: 'Bosnia', flag: 'ba' }, date: 'Jun 18', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md2-3', matchday: 2, stage: 'group', group: 'B', homeTeam: { name: 'Canada', flag: 'ca' }, awayTeam: { name: 'Qatar', flag: 'qa' }, date: 'Jun 18', time: '6:00 PM ET', status: 'scheduled' },
      { id: 'md2-4', matchday: 2, stage: 'group', group: 'A', homeTeam: { name: 'Mexico', flag: 'mx' }, awayTeam: { name: 'Korea Republic', flag: 'kr' }, date: 'Jun 18', time: '9:00 PM ET', status: 'scheduled' },
      // Jun 19
      { id: 'md2-5', matchday: 2, stage: 'group', group: 'D', homeTeam: { name: 'USA', flag: 'us' }, awayTeam: { name: 'Australia', flag: 'au' }, date: 'Jun 19', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md2-6', matchday: 2, stage: 'group', group: 'C', homeTeam: { name: 'Scotland', flag: 'gb-sct' }, awayTeam: { name: 'Morocco', flag: 'ma' }, date: 'Jun 19', time: '6:00 PM ET', status: 'scheduled' },
      { id: 'md2-7', matchday: 2, stage: 'group', group: 'C', homeTeam: { name: 'Brazil', flag: 'br' }, awayTeam: { name: 'Haiti', flag: 'ht' }, date: 'Jun 19', time: '8:30 PM ET', status: 'scheduled' },
      { id: 'md2-8', matchday: 2, stage: 'group', group: 'D', homeTeam: { name: 'Türkiye', flag: 'tr' }, awayTeam: { name: 'Paraguay', flag: 'py' }, date: 'Jun 19', time: '11:00 PM ET', status: 'scheduled' },
      // Jun 20
      { id: 'md2-9', matchday: 2, stage: 'group', group: 'F', homeTeam: { name: 'Netherlands', flag: 'nl' }, awayTeam: { name: 'Sweden', flag: 'se' }, date: 'Jun 20', time: '1:00 PM ET', status: 'scheduled' },
      { id: 'md2-10', matchday: 2, stage: 'group', group: 'E', homeTeam: { name: 'Germany', flag: 'de' }, awayTeam: { name: 'Ivory Coast', flag: 'ci' }, date: 'Jun 20', time: '4:00 PM ET', status: 'scheduled' },
      { id: 'md2-11', matchday: 2, stage: 'group', group: 'E', homeTeam: { name: 'Ecuador', flag: 'ec' }, awayTeam: { name: 'Curaçao', flag: 'cw' }, date: 'Jun 20', time: '8:00 PM ET', status: 'scheduled' },
      // Jun 21
      { id: 'md2-12', matchday: 2, stage: 'group', group: 'F', homeTeam: { name: 'Tunisia', flag: 'tn' }, awayTeam: { name: 'Japan', flag: 'jp' }, date: 'Jun 21', time: '12:00 AM ET', status: 'scheduled' },
      { id: 'md2-13', matchday: 2, stage: 'group', group: 'H', homeTeam: { name: 'Spain', flag: 'es' }, awayTeam: { name: 'Saudi Arabia', flag: 'sa' }, date: 'Jun 21', time: '12:00 PM ET', status: 'scheduled' },
      { id: 'md2-14', matchday: 2, stage: 'group', group: 'G', homeTeam: { name: 'Belgium', flag: 'be' }, awayTeam: { name: 'Iran', flag: 'ir' }, date: 'Jun 21', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md2-15', matchday: 2, stage: 'group', group: 'H', homeTeam: { name: 'Uruguay', flag: 'uy' }, awayTeam: { name: 'Cape Verde', flag: 'cv' }, date: 'Jun 21', time: '6:00 PM ET', status: 'scheduled' },
      { id: 'md2-16', matchday: 2, stage: 'group', group: 'G', homeTeam: { name: 'New Zealand', flag: 'nz' }, awayTeam: { name: 'Egypt', flag: 'eg' }, date: 'Jun 21', time: '9:00 PM ET', status: 'scheduled' },
      // Jun 22
      { id: 'md2-17', matchday: 2, stage: 'group', group: 'J', homeTeam: { name: 'Argentina', flag: 'ar' }, awayTeam: { name: 'Austria', flag: 'at' }, date: 'Jun 22', time: '1:00 PM ET', status: 'scheduled' },
      { id: 'md2-18', matchday: 2, stage: 'group', group: 'I', homeTeam: { name: 'France', flag: 'fr' }, awayTeam: { name: 'Iraq', flag: 'iq' }, date: 'Jun 22', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md2-19', matchday: 2, stage: 'group', group: 'I', homeTeam: { name: 'Norway', flag: 'no' }, awayTeam: { name: 'Senegal', flag: 'sn' }, date: 'Jun 22', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md2-20', matchday: 2, stage: 'group', group: 'J', homeTeam: { name: 'Jordan', flag: 'jo' }, awayTeam: { name: 'Algeria', flag: 'dz' }, date: 'Jun 22', time: '11:00 PM ET', status: 'scheduled' },
      // Jun 23
      { id: 'md2-21', matchday: 2, stage: 'group', group: 'K', homeTeam: { name: 'Portugal', flag: 'pt' }, awayTeam: { name: 'Uzbekistan', flag: 'uz' }, date: 'Jun 23', time: '1:00 PM ET', status: 'scheduled' },
      { id: 'md2-22', matchday: 2, stage: 'group', group: 'L', homeTeam: { name: 'England', flag: 'gb-eng' }, awayTeam: { name: 'Ghana', flag: 'gh' }, date: 'Jun 23', time: '4:00 PM ET', status: 'scheduled' },
      { id: 'md2-23', matchday: 2, stage: 'group', group: 'L', homeTeam: { name: 'Panama', flag: 'pa' }, awayTeam: { name: 'Croatia', flag: 'hr' }, date: 'Jun 23', time: '7:00 PM ET', status: 'scheduled' },
      { id: 'md2-24', matchday: 2, stage: 'group', group: 'K', homeTeam: { name: 'Colombia', flag: 'co' }, awayTeam: { name: 'DR Congo', flag: 'cd' }, date: 'Jun 23', time: '10:00 PM ET', status: 'scheduled' },
    ],
    3: [
      // Jun 24
      { id: 'md3-1', matchday: 3, stage: 'group', group: 'B', homeTeam: { name: 'Switzerland', flag: 'ch' }, awayTeam: { name: 'Canada', flag: 'ca' }, date: 'Jun 24', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md3-2', matchday: 3, stage: 'group', group: 'B', homeTeam: { name: 'Bosnia', flag: 'ba' }, awayTeam: { name: 'Qatar', flag: 'qa' }, date: 'Jun 24', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md3-3', matchday: 3, stage: 'group', group: 'C', homeTeam: { name: 'Scotland', flag: 'gb-sct' }, awayTeam: { name: 'Brazil', flag: 'br' }, date: 'Jun 24', time: '6:00 PM ET', status: 'scheduled' },
      { id: 'md3-4', matchday: 3, stage: 'group', group: 'C', homeTeam: { name: 'Morocco', flag: 'ma' }, awayTeam: { name: 'Haiti', flag: 'ht' }, date: 'Jun 24', time: '6:00 PM ET', status: 'scheduled' },
      { id: 'md3-5', matchday: 3, stage: 'group', group: 'A', homeTeam: { name: 'Czechia', flag: 'cz' }, awayTeam: { name: 'Mexico', flag: 'mx' }, date: 'Jun 24', time: '9:00 PM ET', status: 'scheduled' },
      { id: 'md3-6', matchday: 3, stage: 'group', group: 'A', homeTeam: { name: 'South Africa', flag: 'za' }, awayTeam: { name: 'Korea Republic', flag: 'kr' }, date: 'Jun 24', time: '9:00 PM ET', status: 'scheduled' },
      // Jun 25
      { id: 'md3-7', matchday: 3, stage: 'group', group: 'E', homeTeam: { name: 'Curaçao', flag: 'cw' }, awayTeam: { name: 'Ivory Coast', flag: 'ci' }, date: 'Jun 25', time: '4:00 PM ET', status: 'scheduled' },
      { id: 'md3-8', matchday: 3, stage: 'group', group: 'E', homeTeam: { name: 'Ecuador', flag: 'ec' }, awayTeam: { name: 'Germany', flag: 'de' }, date: 'Jun 25', time: '4:00 PM ET', status: 'scheduled' },
      { id: 'md3-9', matchday: 3, stage: 'group', group: 'F', homeTeam: { name: 'Japan', flag: 'jp' }, awayTeam: { name: 'Sweden', flag: 'se' }, date: 'Jun 25', time: '7:00 PM ET', status: 'scheduled' },
      { id: 'md3-10', matchday: 3, stage: 'group', group: 'F', homeTeam: { name: 'Tunisia', flag: 'tn' }, awayTeam: { name: 'Netherlands', flag: 'nl' }, date: 'Jun 25', time: '7:00 PM ET', status: 'scheduled' },
      { id: 'md3-11', matchday: 3, stage: 'group', group: 'D', homeTeam: { name: 'Türkiye', flag: 'tr' }, awayTeam: { name: 'USA', flag: 'us' }, date: 'Jun 25', time: '10:00 PM ET', status: 'scheduled' },
      { id: 'md3-12', matchday: 3, stage: 'group', group: 'D', homeTeam: { name: 'Paraguay', flag: 'py' }, awayTeam: { name: 'Australia', flag: 'au' }, date: 'Jun 25', time: '10:00 PM ET', status: 'scheduled' },
      // Jun 26
      { id: 'md3-13', matchday: 3, stage: 'group', group: 'I', homeTeam: { name: 'Norway', flag: 'no' }, awayTeam: { name: 'France', flag: 'fr' }, date: 'Jun 26', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md3-14', matchday: 3, stage: 'group', group: 'I', homeTeam: { name: 'Senegal', flag: 'sn' }, awayTeam: { name: 'Iraq', flag: 'iq' }, date: 'Jun 26', time: '3:00 PM ET', status: 'scheduled' },
      { id: 'md3-15', matchday: 3, stage: 'group', group: 'H', homeTeam: { name: 'Cape Verde', flag: 'cv' }, awayTeam: { name: 'Saudi Arabia', flag: 'sa' }, date: 'Jun 26', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md3-16', matchday: 3, stage: 'group', group: 'H', homeTeam: { name: 'Uruguay', flag: 'uy' }, awayTeam: { name: 'Spain', flag: 'es' }, date: 'Jun 26', time: '8:00 PM ET', status: 'scheduled' },
      { id: 'md3-17', matchday: 3, stage: 'group', group: 'G', homeTeam: { name: 'Egypt', flag: 'eg' }, awayTeam: { name: 'Iran', flag: 'ir' }, date: 'Jun 26', time: '11:00 PM ET', status: 'scheduled' },
      { id: 'md3-18', matchday: 3, stage: 'group', group: 'G', homeTeam: { name: 'New Zealand', flag: 'nz' }, awayTeam: { name: 'Belgium', flag: 'be' }, date: 'Jun 26', time: '11:00 PM ET', status: 'scheduled' },
      // Jun 27
      { id: 'md3-19', matchday: 3, stage: 'group', group: 'L', homeTeam: { name: 'Panama', flag: 'pa' }, awayTeam: { name: 'England', flag: 'gb-eng' }, date: 'Jun 27', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md3-20', matchday: 3, stage: 'group', group: 'L', homeTeam: { name: 'Croatia', flag: 'hr' }, awayTeam: { name: 'Ghana', flag: 'gh' }, date: 'Jun 27', time: '5:00 PM ET', status: 'scheduled' },
      { id: 'md3-21', matchday: 3, stage: 'group', group: 'K', homeTeam: { name: 'Colombia', flag: 'co' }, awayTeam: { name: 'Portugal', flag: 'pt' }, date: 'Jun 27', time: '7:30 PM ET', status: 'scheduled' },
      { id: 'md3-22', matchday: 3, stage: 'group', group: 'K', homeTeam: { name: 'DR Congo', flag: 'cd' }, awayTeam: { name: 'Uzbekistan', flag: 'uz' }, date: 'Jun 27', time: '7:30 PM ET', status: 'scheduled' },
      { id: 'md3-23', matchday: 3, stage: 'group', group: 'J', homeTeam: { name: 'Algeria', flag: 'dz' }, awayTeam: { name: 'Austria', flag: 'at' }, date: 'Jun 27', time: '10:00 PM ET', status: 'scheduled' },
      { id: 'md3-24', matchday: 3, stage: 'group', group: 'J', homeTeam: { name: 'Jordan', flag: 'jo' }, awayTeam: { name: 'Argentina', flag: 'ar' }, date: 'Jun 27', time: '10:00 PM ET', status: 'scheduled' },
    ],
  }
  return realMatchesByDay[matchday] || []
}
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

// Parse match date/time into a Date object
function parseMatchDateTime(matchDate, matchTime) {
  const year = 2026
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const [monthStr, dayStr] = matchDate.split(' ')
  const month = months[monthStr]
  const day = parseInt(dayStr)
  
  const timeMatch = matchTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!timeMatch) return null
  
  let hours = parseInt(timeMatch[1])
  const mins = parseInt(timeMatch[2])
  const ampm = timeMatch[3].toUpperCase()
  
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  
  return new Date(year, month, day, hours, mins)
}

// Get deadline offset in milliseconds based on deadline type
function getDeadlineOffset(deadlineType) {
  switch (deadlineType) {
    case '30m_before_matchday': return 30 * 60 * 1000   // 30 minutes before first match of day
    case '1h_before_matchday': return 60 * 60 * 1000    // 1 hour
    case '2h_before_matchday': return 2 * 60 * 60 * 1000 // 2 hours
    case '24h_before_matchday': return 24 * 60 * 60 * 1000 // 24 hours
    default: return 60 * 60 * 1000 // Default 1 hour
  }
}

// Check if a specific match is locked (for per-match deadline mode)
function isMatchLocked(matchDate, matchTime, deadlineType) {
  const matchDateTime = parseMatchDateTime(matchDate, matchTime)
  if (!matchDateTime) return false
  
  const offset = getDeadlineOffset(deadlineType)
  const lockTime = new Date(matchDateTime.getTime() - offset)
  
  return new Date() >= lockTime
}

// Helper to check if picks for a match date are locked (based on first game of that day)
function isDateLocked(matchDate, matchTime, deadlineType = '1h_before_matchday') {
  const matchDateTime = parseMatchDateTime(matchDate, matchTime)
  if (!matchDateTime) return false
  
  const offset = getDeadlineOffset(deadlineType)
  const lockTime = new Date(matchDateTime.getTime() - offset)
  
  return new Date() >= lockTime
}

// Group matches by date and get earliest time for each date
// Also returns per-match lock status for '30m_before_match' mode
function getDateLockStatus(matches, deadlineType = '1h_before_matchday') {
  const dateGroups = {}
  const matchLockStatus = {} // Per-match lock status
  
  matches.forEach(m => {
    if (!dateGroups[m.date]) {
      dateGroups[m.date] = { matches: [], earliestTime: m.time }
    }
    dateGroups[m.date].matches.push(m)
    
    // Keep track of earliest time for this date
    if (m.time < dateGroups[m.date].earliestTime) {
      dateGroups[m.date].earliestTime = m.time
    }
    
    // For per-match mode, check each match individually
    if (deadlineType === '30m_before_match') {
      matchLockStatus[m.id] = isMatchLocked(m.date, m.time, deadlineType)
    }
  })
  
  // Check if each date is locked (for matchday-based deadlines)
  const dateLockStatus = {}
  Object.keys(dateGroups).forEach(date => {
    dateLockStatus[date] = isDateLocked(date, dateGroups[date].earliestTime, deadlineType)
  })
  
  return { dateLockStatus, matchLockStatus, deadlineType }
}

export default function PredictionsPage() {
  const params = useParams()
  const router = useRouter()
  const [matchday, setMatchday] = useState(1)
  const [matches, setMatches] = useState([])
  const [picks, setPicks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [user, setUser] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [pool, setPool] = useState(null)
  const [deadline, setDeadline] = useState(null)
  const [dateLockStatus, setDateLockStatus] = useState({})
  const [matchLockStatus, setMatchLockStatus] = useState({})
  const [deadlineType, setDeadlineType] = useState('1h_before_matchday')

  // Load data on mount and matchday change
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get current user
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Load pool info
      const { data: poolData } = await supabase
        .from('pools')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (poolData) {
        setPool(poolData)
        // Get pool's deadline type, default to '1h_before_matchday'
        const poolDeadlineType = poolData.prediction_deadline || '1h_before_matchday'
        setDeadlineType(poolDeadlineType)
      }

      // Get pool membership
      const { data: memberData } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', params.id)
        .eq('user_id', currentUser.id)
        .single()
      
      if (memberData) setPoolMember(memberData)

      // Load matches based on tournament type
      let matchList
      if (poolData?.tournament === 'rg2026') {
        // Roland Garros 2026 (TEST)
        matchList = getRGMatches(matchday)
        setDeadline(new Date('2026-05-24T10:00:00-04:00'))
      } else {
        // Default: World Cup 2026
        matchList = getDemoMatches(matchday)
        setDeadline(new Date('2026-06-11T12:00:00-04:00'))
      }
      
      // Get lock status based on pool's deadline setting
      const poolDeadlineType = poolData?.prediction_deadline || '1h_before_matchday'
      const lockResult = getDateLockStatus(matchList, poolDeadlineType)
      
      setMatches(matchList)
      setDateLockStatus(lockResult.dateLockStatus)
      setMatchLockStatus(lockResult.matchLockStatus)

      // Load existing picks for this user (always try if we have memberData and matches)
      if (memberData && matchList.length > 0) {
        const matchIds = matchList.map(m => m.id)
        console.log('Loading picks for member:', memberData.id, 'matches:', matchIds)
        
        const { data: existingPicks, error: picksError } = await supabase
          .from('match_picks')
          .select('*')
          .eq('pool_member_id', memberData.id)
          .in('match_id', matchIds)

        console.log('Existing picks loaded:', existingPicks, 'error:', picksError)

        if (existingPicks && existingPicks.length > 0) {
          const picksMap = {}
          existingPicks.forEach(pick => {
            picksMap[pick.match_id] = {
              homeScore: pick.home_score,
              awayScore: pick.away_score,
              saved: true,
              savedAt: pick.submitted_at,
              pointsEarned: pick.points_earned,
            }
          })
          setPicks(picksMap)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [matchday, params.id, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleScoreChange = (matchId, side, value) => {
    const numValue = value === '' ? null : parseInt(value)
    setPicks(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${side}Score`]: numValue,
        saved: false,
      }
    }))
  }

  const handleSave = async (matchId) => {
    const pick = picks[matchId]
    if (pick?.homeScore === null || pick?.awayScore === null || pick?.homeScore === undefined || pick?.awayScore === undefined) {
      alert('Please enter both scores')
      return
    }

    setSaving(prev => ({ ...prev, [matchId]: true }))
    
    const submittedAt = new Date().toISOString()
    
    try {
      // Upsert the pick
      const { error } = await supabase
        .from('match_picks')
        .upsert({
          pool_member_id: poolMember.id,
          match_id: matchId,
          home_score: pick.homeScore,
          away_score: pick.awayScore,
          locked: false,
          submitted_at: submittedAt,
        }, {
          onConflict: 'pool_member_id,match_id'
        })

      if (error) throw error

      // Sync to Google Sheets (fire and forget - don't block on this)
      const match = matches.find(m => m.id === matchId)
      fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_pick',
          data: {
            poolId: params.id,
            poolName: pool?.name,
            poolMemberId: poolMember.id,
            userId: user?.id,
            userName: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : user?.email,
            userEmail: user?.email,
            teamName: poolMember?.team_name,
            matchId: matchId,
            matchInfo: match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : matchId,
            homeScore: pick.homeScore,
            awayScore: pick.awayScore,
            submittedAt: submittedAt,
          }
        })
      }).catch(err => console.warn('Sheets sync failed (non-blocking):', err))

      setPicks(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          saved: true,
          savedAt: 'Just now',
        }
      }))
    } catch (error) {
      console.error('Error saving pick:', error)
      alert('Failed to save pick: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const handleClear = (matchId) => {
    setPicks(prev => ({
      ...prev,
      [matchId]: {
        homeScore: null,
        awayScore: null,
        saved: false,
      }
    }))
  }

  const getMatchStatus = (match) => {
    const now = new Date()
    const matchTime = new Date(match.matchTime)
    const pick = picks[match.id]

    if (match.status === 'completed') return 'ft'
    if (match.status === 'live') return 'live'
    if (matchTime <= now) return 'locked'
    if (pick?.saved) return 'saved'
    return 'open'
  }

  const formatDeadline = () => {
    if (!deadline) return 'Loading...'
    return deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    }) + ' ET'
  }

  const getCountdown = () => {
    if (!deadline) return '--:--:--'
    const now = new Date()
    const diff = deadline - now
    if (diff <= 0) return 'LOCKED'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Count submitted picks
  const submittedCount = matches.filter(m => picks[m.id]?.saved).length
  const totalMatches = matches.length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>
        Loading matches...
      </div>
    )
  }

  // Format user name like dashboard
  const getUserName = () => {
    if (!user) return 'User'
    const meta = user.user_metadata || {}
    if (meta.first_name) return `${meta.first_name} ${meta.last_name?.[0] || ''}.`
    return user.email?.split('@')[0] || 'User'
  }
  
  const getUserInitials = () => {
    if (!user) return 'U'
    const meta = user.user_metadata || {}
    const first = meta.first_name?.[0] || user.email?.[0] || 'U'
    const last = meta.last_name?.[0] || ''
    return (first + last).toUpperCase()
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-links">
          <Link href="/dashboard" className="tb-link">Dashboard</Link>
          <span className="tb-link active">{pool?.name || 'Pool'}</span>
        </div>
        <div className="topbar-right">
          <Link href="/profile" className="user-pill">
            <div className="user-avatar">{getUserInitials()}</div>
            {getUserName()}
          </Link>
          <button className="signout-btn" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>Sign Out</button>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href="/browse" className="nav-item">Browse</Link>
          <Link href="/results" className="nav-item">Scores</Link>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">Match Picks</div>
            <div className="ph-meta">FIFA World Cup 2026 · Matchday {matchday}</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{poolMember?.total_points || 0} pts</div>
            <div className="ph-rank">{poolMember?.rank ? `${poolMember.rank}${poolMember.rank === 1 ? 'st' : poolMember.rank === 2 ? 'nd' : poolMember.rank === 3 ? 'rd' : 'th'} place` : '-'}</div>
          </div>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="tab-nav">
        <div className="tab-nav-inner">
          <span className="tab active">Match Picks{submittedCount < totalMatches && <span className="tab-badge">{totalMatches - submittedCount}</span>}</span>
          <Link href={`/pool/${params.id}/special-picks`} className="tab">Special Picks</Link>
          <Link href={`/pool/${params.id}`} className="tab">Leaderboard</Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Matchday strip */}
            <div className="md-strip">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((md) => {
                const labels = ['MD 1', 'MD 2', 'MD 3', 'R32', 'R16', 'QF', 'SF', 'F']
                return (
                  <button 
                    key={md}
                    className={`md-btn ${md === matchday ? 'active' : ''} ${md < matchday ? 'done' : ''}`}
                    onClick={() => setMatchday(md)}
                  >
                    {labels[md - 1]}
                  </button>
                )
              })}
            </div>

            {/* Deadline banner */}
            <div className="deadline-banner">
              <div>
                <div className="db-left">Matchday {matchday} · Picks close {formatDeadline()}</div>
                <div className="db-sub">Submit all picks before the first match kicks off</div>
              </div>
              <div className="db-countdown">{getCountdown()}</div>
            </div>

            {/* No matches message */}
            {matches.length === 0 && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚽</div>
                  <div style={{ color: 'var(--f2)', marginBottom: '0.5rem' }}>No matches for Matchday {matchday}</div>
                  <div style={{ color: 'var(--f4)', fontSize: '0.85rem' }}>
                    {matchday > 3 ? 'Knockout matches will appear after group stage' : 'Try running the seed script first'}
                  </div>
                </div>
              </div>
            )}

            {/* Match cards */}
            {matches.map(match => {
              const status = getMatchStatus(match)
              const pick = picks[match.id] || {}
              // Check lock status: per-match for '30m_before_match', otherwise per-date
              const isTimeLocked = deadlineType === '30m_before_match' 
                ? (matchLockStatus[match.id] || false)
                : (dateLockStatus[match.date] || false)
              const isLocked = ['live', 'ft', 'locked'].includes(status) || isTimeLocked
              
              return (
                <div key={match.id} className={`mpc ${status === 'saved' ? 'submitted' : ''} ${isLocked ? 'locked-card' : ''}`}>
                  <div className="mpc-head">
                    <div className="mpc-info">
                      {match.group ? `Group ${match.group} · ` : ''}{match.date} · {match.time}
                    </div>
                    <div className={`mpc-status s-${isTimeLocked && status !== 'live' && status !== 'ft' ? 'locked' : status}`}>
                      {status === 'open' && !isTimeLocked && 'Open'}
                      {status === 'saved' && !isTimeLocked && '✓ Saved'}
                      {status === 'live' && <><span className="live-dot"></span>Live</>}
                      {status === 'ft' && 'FT'}
                      {(status === 'locked' || (isTimeLocked && status !== 'live' && status !== 'ft')) && '🔒 Locked'}
                    </div>
                  </div>
                  <div className="mpc-body">
                    <div className="team-side">
                      <div className="team-flag">
                        <img src={`https://flagcdn.com/w80/${match.homeTeam.flag}.png`} alt="" />
                      </div>
                      <div className="team-nm">{match.homeTeam.name}</div>
                    </div>
                    <div className="score-center">
                      {status === 'live' && (
                        <div className="live-label">Live {match.homeScore} – {match.awayScore}</div>
                      )}
                      {status === 'ft' && (
                        <div className="ft-label">Final {match.homeScore} – {match.awayScore}</div>
                      )}
                      
                      {!isLocked ? (
                        <>
                          <div className="score-status">Pick your score</div>
                          <div className="score-inputs">
                            <input 
                              className={`si ${pick.homeScore !== null && pick.homeScore !== undefined ? 'filled' : ''}`}
                              type="number" 
                              min="0" 
                              max="20" 
                              placeholder="0"
                              value={pick.homeScore ?? ''}
                              onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                            />
                            <span className="sc-dash">-</span>
                            <input 
                              className={`si ${pick.awayScore !== null && pick.awayScore !== undefined ? 'filled' : ''}`}
                              type="number" 
                              min="0" 
                              max="20" 
                              placeholder="0"
                              value={pick.awayScore ?? ''}
                              onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                            />
                          </div>
                        </>
                      ) : pick.homeScore !== undefined ? (
                        <>
                          <div className="score-display">
                            <span className={`sd-val ${isLocked ? 'muted' : ''}`}>{pick.homeScore}</span>
                            <span className="sd-sep">–</span>
                            <span className={`sd-val ${isLocked ? 'muted' : ''}`}>{pick.awayScore}</span>
                          </div>
                          <div className="pick-label">Your pick</div>
                          {pick.pointsEarned > 0 && <span className="pts-badge">+{pick.pointsEarned} pts</span>}
                        </>
                      ) : (
                        <div className="pick-label" style={{ color: 'var(--red)' }}>No pick submitted</div>
                      )}
                    </div>
                    <div className="team-side">
                      <div className="team-flag">
                        <img src={`https://flagcdn.com/w80/${match.awayTeam.flag}.png`} alt="" />
                      </div>
                      <div className="team-nm">{match.awayTeam.name}</div>
                    </div>
                  </div>
                  {status === 'open' && (
                    <div className="mpc-foot">
                      <button className="btn-edit" onClick={() => handleClear(match.id)}>Clear</button>
                      <button 
                        className="btn-save" 
                        onClick={() => handleSave(match.id)}
                        disabled={saving[match.id]}
                      >
                        {saving[match.id] ? 'Saving...' : 'Save Pick'}
                      </button>
                    </div>
                  )}
                  {status === 'saved' && !isLocked && (
                    <div className="mpc-foot">
                      <div style={{ fontSize: '0.7rem', color: 'var(--f3)' }}>
                        Saved {typeof pick.savedAt === 'string' ? pick.savedAt : new Date(pick.savedAt).toLocaleString()}
                      </div>
                      <button className="btn-edit" onClick={() => setPicks(prev => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], saved: false }
                      }))}>Edit</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Matchday {matchday} Progress</div></div>
              <div className="card-body">
                <div className="sc-row">
                  <div className="sc-label">Picks submitted</div>
                  <div className={`sc-val ${submittedCount === totalMatches ? 'green' : ''}`}>
                    {submittedCount} / {totalMatches}
                  </div>
                </div>
                <div className="sc-row"><div className="sc-label">Total points</div><div className="sc-val">{poolMember?.total_points || 0}</div></div>
                <div className="sc-row"><div className="sc-label">Your rank</div><div className="sc-val gold">{poolMember?.rank || '-'}</div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Scoring</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Exact scoreline</div><div className="sc-val gold">3 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct result only</div><div className="sc-val gold">1 pt</div></div>
                <div className="sc-row"><div className="sc-label">Knockout multiplier</div><div className="sc-val gold">1.5x – 3x</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* TOPBAR */
        .topbar { background: var(--bg); border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 36px; }
        .topbar-links { display: flex; gap: 1.5rem; }
        .tb-link { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); text-decoration: none; }
        .tb-link:hover, .tb-link.active { color: var(--f2); }
        .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--f2); text-decoration: none; cursor: pointer; transition: color 0.15s; }
        .user-pill:hover { color: var(--gold); }
        .user-avatar { width: 22px; height: 22px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 800; color: #000; }
        .signout-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid var(--f4); color: var(--f3); padding: 0.35rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .signout-btn:hover { border-color: var(--gold); color: var(--gold); }

        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid var(--f4); text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        .page-header { background: var(--bg2); border-bottom: 1px solid var(--line); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: var(--white); }
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; }
        .ph-right { text-align: right; }
        .ph-score { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; color: var(--gold); line-height: 1; }
        .ph-rank { font-size: 0.72rem; color: var(--f3); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Barlow Condensed', sans-serif; margin-top: 2px; }

        /* Tab styles now in globals.css */
        .tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); color: #000; font-size: 0.6rem; font-weight: 900; }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .two-col { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }

        .md-strip { display: flex; gap: 0; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1.25rem; }
        .md-btn { flex: 1; padding: 0.45rem 0; text-align: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--bg2); color: var(--f3); border: none; cursor: pointer; border-right: 1px solid var(--line); transition: all 0.15s; }
        .md-btn:last-child { border-right: none; }
        .md-btn.active { background: var(--gold); color: #000; }
        .md-btn.done { color: var(--green); }
        .md-btn.locked { color: var(--f4); cursor: default; }

        .deadline-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(201,168,76,0.07); border: 1px solid var(--gold-line); border-radius: 4px; padding: 0.6rem 1rem; margin-bottom: 1.25rem; }
        .db-left { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold); }
        .db-sub { font-size: 0.7rem; color: var(--f3); margin-top: 1px; }
        .db-countdown { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 900; color: var(--gold); letter-spacing: 0.04em; }

        .mpc { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 2px; }
        .mpc.submitted { border-color: rgba(44,182,125,0.25); }
        .mpc.locked-card { opacity: 0.65; }
        .mpc-head { background: var(--bg3); padding: 0.4rem 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
        .mpc-info { font-family: 'Barlow Condensed', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); }
        .mpc-status { font-family: 'Barlow Condensed', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
        .s-open { color: var(--green); }
        .s-saved { color: var(--green); }
        .s-live { color: var(--red); }
        .s-ft { color: var(--f4); }
        .s-locked { color: var(--f4); }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: pulse 1.4s ease infinite; }

        .mpc-body { display: grid; grid-template-columns: 1fr 170px 1fr; align-items: center; gap: 0; padding: 0.85rem 1rem; }
        .team-side { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .team-flag img { width: 42px; height: 29px; border-radius: 3px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .team-nm { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--f1); text-align: center; }
        .score-center { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .score-status { font-family: 'Barlow Condensed', sans-serif; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); }
        .live-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--red); margin-bottom: 2px; }
        .ft-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); margin-bottom: 2px; }
        .pick-label { font-size: 0.65rem; color: var(--f4); margin-top: 2px; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }

        .score-inputs { display: flex; align-items: center; gap: 6px; }
        .si { width: 50px; height: 50px; background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; color: var(--white); font-family: 'Barlow Condensed', sans-serif; font-size: 1.7rem; font-weight: 900; text-align: center; outline: none; transition: border-color 0.15s; -moz-appearance: textfield; padding: 0; }
        .si::-webkit-outer-spin-button, .si::-webkit-inner-spin-button { -webkit-appearance: none; }
        .si:focus { border-color: var(--gold); }
        .si.filled { border-color: rgba(44,182,125,0.4); background: rgba(44,182,125,0.04); }
        .sc-dash { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 900; color: var(--f4); }

        .score-display { display: flex; align-items: center; gap: 6px; }
        .sd-val { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; color: var(--gold); min-width: 30px; text-align: center; line-height: 1; }
        .sd-val.muted { color: var(--f2); }
        .sd-sep { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--f4); }
        .pts-badge { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 2px; background: rgba(44,182,125,0.12); color: var(--green); border: 1px solid rgba(44,182,125,0.25); margin-top: 3px; }

        .mpc-foot { border-top: 1px solid var(--line); padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; background: rgba(0,0,0,0.15); }
        .btn-save { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.4rem 1.1rem; border-radius: 2px; border: none; cursor: pointer; }
        .btn-save:hover { background: var(--gold2); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-edit { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; color: var(--f3); border: 1px solid var(--f4); padding: 0.35rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .btn-edit:hover { color: var(--f1); border-color: var(--f2); }

        .card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { background: var(--bg3); padding: 0.65rem 1rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .card-body { padding: 1rem; }
        .sc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sc-row:last-child { border-bottom: none; }
        .sc-label { font-size: 0.75rem; color: var(--f3); }
        .sc-val { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--f1); }
        .sc-val.gold { color: var(--gold); }
        .sc-val.green { color: var(--green); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

        @media (max-width: 900px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .two-col { grid-template-columns: 1fr; }
          .mpc-body { grid-template-columns: 1fr 120px 1fr; }
          .si { width: 40px; height: 40px; font-size: 1.4rem; }
          .md-strip { overflow-x: auto; }
        }
      `}</style>
    </>
  )
}
