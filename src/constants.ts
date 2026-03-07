import type { GlobalThemeOverrides } from 'naive-ui';
import type { PrimaryColorScheme } from './types';

export const DOMAIN = 'ikizuxiv.ouuan.moe';
export const URL = `https://${DOMAIN}`;

interface MemberInfo {
  username: string;
  name: string;
  oldname: string;
  color: string;
}

export const RELEASE_DATE = new Date('2025-05-12');
export const MEMBER_SUFFIX = '@いきづらい部！';
export const NOT_MEMBER_LABEL = '入部前';

export const MEMBERS: MemberInfo[] = [
  {
    username: 'polka_lion',
    name: '高橋ポルカ',
    oldname: 'Polka',
    color: '#f0f060', // reduced brightness
  },
  {
    username: 'My_Mai_Eld',
    name: '麻布麻衣',
    oldname: 'mai',
    color: '#4d93d9',
  },
  {
    username: 'G_Akky304250',
    name: '五桐 玲',
    oldname: 'Akira',
    color: '#b5e6a2',
  },
  {
    username: 'hanabistarmine',
    name: '駒形花火',
    oldname: '🎆',
    color: '#ff4747',
  },
  {
    username: 'MiracleGoldSP',
    name: '金澤奇跡',
    oldname: 'Miracle',
    color: '#ffb6c1',
  },
  {
    username: 'Noricco_U',
    name: '調布のりこ',
    oldname: 'のりこ',
    color: '#cc66ff',
  },
  {
    username: 'Yukuri_talk',
    name: '春宮ゆくり',
    oldname: 'Yukuri',
    color: '#c0e6f5',
  },
  {
    username: 'Rollie_twinkle',
    name: '此花輝夜',
    oldname: 'Rollie',
    color: '#ff5b9d',
  },
  {
    username: 'LittlegreenCom',
    name: '山田真緑',
    oldname: 'Little🌵🌳green',
    color: '#3fbf7f',
  },
  {
    username: 'ShaunTheBunny',
    name: '佐々木翔音',
    oldname: 'shion',
    color: '#e8e8e8', // reduced brightness
  },
];

interface GroupInfo {
  name: string;
  members: string[];
}

export const GROUPS: Record<string, GroupInfo> = {
  asakusa: {
    name: '浅草分校',
    members: ['polka_lion', 'My_Mai_Eld', 'G_Akky304250', 'hanabistarmine'],
  },
  fukuiken: {
    name: '福井分校',
    members: ['MiracleGoldSP', 'Noricco_U'],
  },
  umeda: {
    name: '梅田分校',
    members: ['Yukuri_talk', 'Rollie_twinkle', 'LittlegreenCom'],
  },
  sendai: {
    name: '仙台分校',
    members: ['ShaunTheBunny'],
  },
};

export const NAMES = MEMBERS.reduce<Record<string, {
  old: string;
  new: string;
}>>((acc, member) => {
  acc[member.username] = {
    old: member.oldname,
    new: member.name,
  };
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
