export interface Model {
  id: number
  folderName: string
  uploadTime: string
  url: string
  characterId: number
  name: string
  actionCount: number
  cover?: string
  tags?: string[]
  params?: {
    scale?: number
    x?: number
    y?: number
  }
}

export const models: Model[] = [
  {
    id: 1534,
    folderName: 'Rose',
    uploadTime: '2024/12/5 12:22',
    url: 'https://ugenie.net/api/uploads/live2d/Rose/model.json',
    characterId: 100430,
    name: '白切黑护士',
    actionCount: 5,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/1534.jpg',
    tags: ['Rose', 'Live2D']
  },
  {
    id: 1678,
    folderName: 'Isolde2',
    uploadTime: '2024/12/23 11:05',
    url: 'https://ugenie.net/api/uploads/live2d/Isolde2/model.json',
    characterId: 100402,
    name: '毒舌傲娇大小姐',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/1678.jpg',
    tags: ['Isolde2', 'Live2D']
  },
  {
    id: 2731,
    folderName: 'rin4',
    uploadTime: '2025/10/16 11:02',
    url: 'https://ugenie.net/api/uploads/live2d/rin4/model.json',
    characterId: 100403,
    name: '看起来乖巧的女同桌',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2731.jpg',
    tags: ['rin4', 'Live2D']
  },
  {
    id: 2762,
    folderName: 'astra4',
    uploadTime: '2025/10/16 11:16',
    url: 'https://ugenie.net/api/uploads/live2d/astra4/model.json',
    characterId: 100405,
    name: '神出鬼没的冷面间谍',
    actionCount: 3,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2762.png',
    tags: ['astra4', 'Live2D']
  },
  {
    id: 2784,
    folderName: 'aria3',
    uploadTime: '2025/10/17 15:27',
    url: 'https://ugenie.net/api/uploads/live2d/aria3/model.json',
    characterId: 100399,
    name: '失忆小厨娘',
    actionCount: 3,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2784.png',
    tags: ['aria3', 'Live2D']
  },
  {
    id: 2830,
    folderName: 'lily2',
    uploadTime: '2025/10/17 19:40',
    url: 'https://ugenie.net/api/uploads/live2d/lily2/model.json',
    characterId: 100406,
    name: '记忆调酒师',
    actionCount: 5,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2830.jpg',
    tags: ['lily2', 'Live2D']
  },
  {
    id: 2849,
    folderName: 'reno1',
    uploadTime: '2025/10/23 16:37',
    url: 'https://ugenie.net/api/uploads/live2d/reno1/model.json',
    characterId: 100475,
    name: '坏脾气仿生人',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2849.jpg',
    tags: ['reno1', 'Live2D']
  },
  {
    id: 2900,
    folderName: 'g36c2',
    uploadTime: '2025/10/28 16:21',
    url: 'https://ugenie.net/api/uploads/live2d/g36c2/model.json',
    characterId: 100519,
    name: '万圣节鬼魂',
    actionCount: 1,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2900.jpg',
    tags: ['g36c2', 'Live2D']
  },
  {
    id: 2943,
    folderName: 'g36ctrans',
    uploadTime: '2025/10/31 16:02',
    url: 'https://ugenie.net/api/uploads/live2d/g36ctrans/model.json',
    characterId: 100519,
    name: '万圣节鬼魂转换',
    actionCount: 3,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2943.jpg',
    tags: ['g36ctrans', 'Live2D']
  },
  {
    id: 2972,
    folderName: 'rowan',
    uploadTime: '2025/11/11 10:53',
    url: 'https://ugenie.net/api/uploads/live2d/rowan/model.json',
    characterId: 100478,
    name: '野蛮发小居然是女孩子',
    actionCount: 8,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2972.jpg',
    tags: ['rowan', 'Live2D']
  },
  // Problem Models Moved to Bottom
  {
    id: 2106,
    folderName: 'Lumi',
    uploadTime: '2025/3/4 10:18',
    url: 'https://ugenie.net/api/uploads/live2d/Lumi/model.json',
    characterId: 100498,
    name: '天降系妹妹',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2106.jpg',
    tags: ['Lumi', 'Live2D'],
    params: {
      scale: 0.1
    }
  },
  {
    id: 2145,
    folderName: 'Mika',
    uploadTime: '2025/3/4 12:20',
    url: 'https://ugenie.net/api/uploads/live2d/Mika/model.json',
    characterId: 100455,
    name: '赛博陪玩',
    actionCount: 2,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2145.jpg',
    tags: ['Mika', 'Live2D'],
    params: {
      scale: 0.1
    }
  },
  {
    id: 2146,
    folderName: 'Chloe',
    uploadTime: '2025/3/4 12:20',
    url: 'https://ugenie.net/api/uploads/live2d/Chloe/model.json',
    characterId: 100408,
    name: '摸鱼女大学生',
    actionCount: 8,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2146.jpg',
    tags: ['Chloe', 'Live2D'],
    params: {
      scale: 0.1
    }
  },
  {
    id: 2202,
    folderName: 'ruby0',
    uploadTime: '2025/3/4 18:05',
    url: 'https://ugenie.net/api/uploads/live2d/ruby0/model.json',
    characterId: 100410,
    name: '不受控制的时间跳跃者',
    actionCount: 7,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2202.jpg',
    tags: ['ruby0', 'Live2D'],
    params: {
      scale: 0.1
    }
  },
  {
    id: 2242,
    folderName: 'mikamale',
    uploadTime: '2025/5/28 11:48',
    url: 'https://ugenie.net/api/uploads/live2d/mikamale/model.json',
    characterId: 100448,
    name: '危险AI恋人',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2242.jpg',
    tags: ['mikamale', 'Live2D'],
    params: {
      scale: 0.1
    }
  },
  {
    id: 2217,
    folderName: 'Elena',
    uploadTime: '2025/3/19 13:48',
    url: 'https://ugenie.net/api/uploads/live2d/Elena/model.json',
    characterId: 100411,
    name: '网络调情者',
    actionCount: 4,
    cover: 'https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/L2D/2217.jpg',
    tags: ['Elena', 'Live2D'],
    params: {
      scale: 0.1
    }
  }
]
