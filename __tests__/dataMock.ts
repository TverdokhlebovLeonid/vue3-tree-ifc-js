export const mockModelLevels = [
  {
    check: true,
    children: [
      { expressID: 8800, type: 'IFCROOF', children: [] },
      { expressID: 8862, type: 'IFCROOF', children: [] },
      { expressID: 8928, type: 'IFCROOF', children: [] },
    ],
    customID: '0-level',
    expressID: 63,
    ids: [8800, 8862, 8928],
    type: 'IFCBUILDINGSTOREY',
  },
]

export const mockSlot = {
  slots: {
    default: '<div class="vitest-slot-div"><p>Vitest Slot</p></div>',
  },
}

export const mockRoute = {
  path: '/',
  meta: {
    path: 'Default',
    title: 'Просмотр IFC файлов - Vitest',
  },
}
