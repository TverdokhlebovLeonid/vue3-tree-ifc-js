export const mockModelLevels = [
  {
    visible: true,
    children: [
      { expressID: 8800, type: 'IFCROOF', children: [] },
      { expressID: 8862, type: 'IFCROOF', children: [] },
      { expressID: 8928, type: 'IFCROOF', children: [] },
      { expressID: 9000, type: 'IFCSPACE', children: [] },
      {
        expressID: 9100,
        type: 'IFCELEMENTASSEMBLY',
        children: [{ expressID: 9101, type: 'IFCSTAIRFLIGHT', children: [] }],
      },
    ],
    customID: '0-level',
    expressID: 63,
    ids: [8800, 8862, 8928, 9100, 9101],
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
