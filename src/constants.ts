import type { GlobalThemeOverrides } from 'naive-ui';
import type { PrimaryColorScheme } from './types';

export const DOMAIN = 'ikizuxiv.ouuan.moe';
export const URL = `https://${DOMAIN}`;

interface MemberInfo {
  username: string;
  name: string;
  color: string;
}

export const MEMBERS: MemberInfo[] = [
  {
    username: 'polka_lion',
    name: '高橋ポルカ@いきづらい部！',
    color: '#ccb12e',
  },
  {
    username: 'My_Mai_Eld',
    name: '麻布麻衣@いきづらい部！',
    color: '#009fdf',
  },
  {
    username: 'G_Akky304250',
    name: '五桐 玲@いきづらい部！',
    color: '#88d66e',
  },
  {
    username: 'hanabistarmine',
    name: '駒形花火@いきづらい部！',
    color: '#ff2021',
  },
  {
    username: 'MiracleGoldSP',
    name: '金澤奇跡@いきづらい部！',
    color: '#ffb7f1',
  },
  {
    username: 'Noricco_U',
    name: '調布のりこ@いきづらい部！',
    color: '#ae62ff',
  },
  {
    username: 'Yukuri_talk',
    name: '春宮ゆくり@いきづらい部！',
    color: '#5ecbd1',
  },
  {
    username: 'Rollie_twinkle',
    name: '此花輝夜@いきづらい部！',
    color: '#fd589e',
  },
  {
    username: 'LittlegreenCom',
    name: '山田真緑@いきづらい部！',
    color: '#16b500',
  },
  {
    username: 'ShaunTheBunny',
    name: '佐々木翔音@いきづらい部！',
    color: '#9b9b9b',
  },
];

export const NAME = MEMBERS.reduce<Record<string, string>>((acc, member) => {
  acc[member.username] = member.name;
  return acc;
}, {});

export const COLOR = MEMBERS.reduce<Record<string, string>>((acc, member) => {
  acc[member.username] = member.color;
  return acc;
}, {});

export const THEMES: Record<PrimaryColorScheme, GlobalThemeOverrides> = {
  bluebird: {
    common: {
      primaryColor: '#249fde',
      primaryColorHover: '#4db3f0',
      primaryColorPressed: '#1a7fbf',
      primaryColorSuppl: '#d4ecf7',
    },
  },
  ikizuraibu: {
    common: {
      primaryColor: '#ed6d00',
      primaryColorHover: '#f08620',
      primaryColorPressed: '#c95a00',
      primaryColorSuppl: '#fbe4d6',
    },
  },
};
