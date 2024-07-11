import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

import { MemberAccessReportModel } from "../model/member-access-report.model";

export const memberAccessReportsMock: MemberAccessReportModel[] = [
  {
    userName: "Sarah Johnson",
    email: "sjohnson@email.com",
    twoFactorEnabled: true,
    accountRecoveryEnabled: true,
    collections: [
      {
        id: "c1",
        name: new EncString(
          "2.UiXa3L3Ol1G4QnfFfBjMQw==|sbVTj0EiEkhIrDiropn2Cg==|82P78YgmapW4TdN9jQJgMWKv2gGyK1AnGkr+W9/sq+A=",
        ),
        itemCount: 10,
      },
      { id: "c2", name: new EncString("Collection 2"), itemCount: 20 },
      { id: "c3", name: new EncString("Collection 3"), itemCount: 30 },
    ],
    groups: [
      {
        id: "g1",
        name: "Group 1",
        itemCount: 3,
        collections: [
          {
            id: "c6",
            name: new EncString(
              "2.UiXa3L3Ol1G4QnfFfBjMQw==|sbVTj0EiEkhIrDiropn2Cg==|82P78YgmapW4TdN9jQJgMWKv2gGyK1AnGkr+W9/sq+A=",
            ),
            itemCount: 10,
          },
          { id: "c2", name: new EncString("Collection 2"), itemCount: 20 },
        ],
      },
      {
        id: "g2",
        name: "Group 2",
        itemCount: 2,
        collections: [
          { id: "c2", name: new EncString("Collection 2"), itemCount: 20 },
          { id: "c3", name: new EncString("Collection 3"), itemCount: 30 },
        ],
      },
      {
        id: "g3",
        name: "Group 3",
        itemCount: 2,
        collections: [
          {
            id: "c1",
            name: new EncString(
              "2.UiXa3L3Ol1G4QnfFfBjMQw==|sbVTj0EiEkhIrDiropn2Cg==|82P78YgmapW4TdN9jQJgMWKv2gGyK1AnGkr+W9/sq+A=",
            ),
            itemCount: 10,
          },
          { id: "c3", name: new EncString("Collection 3"), itemCount: 30 },
        ],
      },
    ],
  },
  {
    userName: "James Lull",
    email: "jlull@email.com",
    twoFactorEnabled: false,
    accountRecoveryEnabled: false,
    collections: [
      { id: "c4", name: new EncString("Collection 4"), itemCount: 5 },
      { id: "c5", name: new EncString("Collection 5"), itemCount: 15 },
    ],
    groups: [
      {
        id: "g4",
        name: "Group 4",
        itemCount: 2,
        collections: [
          { id: "c4", name: new EncString("Collection 4"), itemCount: 5 },
          { id: "c5", name: new EncString("Collection 5"), itemCount: 15 },
        ],
      },
      {
        id: "g5",
        name: "Group 5",
        itemCount: 1,
        collections: [{ id: "c5", name: new EncString("Collection 5"), itemCount: 15 }],
      },
    ],
  },
  {
    userName: "Beth Williams",
    email: "bwilliams@email.com",
    twoFactorEnabled: true,
    accountRecoveryEnabled: true,
    collections: [{ id: "c6", name: new EncString("Collection 6"), itemCount: 25 }],
    groups: [
      {
        id: "g6",
        name: "Group 6",
        itemCount: 1,
        collections: [{ id: "c4", name: new EncString("Collection 4"), itemCount: 35 }],
      },
    ],
  },
  {
    userName: "Ray Williams",
    email: "rwilliams@email.com",
    twoFactorEnabled: false,
    accountRecoveryEnabled: false,
    collections: [
      { id: "c7", name: new EncString("Collection 7"), itemCount: 8 },
      { id: "c8", name: new EncString("Collection 8"), itemCount: 12 },
      { id: "c9", name: new EncString("Collection 9"), itemCount: 16 },
    ],
    groups: [
      {
        id: "g9",
        name: "Group 9",
        itemCount: 1,
        collections: [{ id: "c7", name: new EncString("Collection 7"), itemCount: 8 }],
      },
      {
        id: "g10",
        name: "Group 10",
        itemCount: 1,
        collections: [{ id: "c8", name: new EncString("Collection 8"), itemCount: 12 }],
      },
      {
        id: "g11",
        name: "Group 11",
        itemCount: 1,
        collections: [{ id: "c9", name: new EncString("Collection 9"), itemCount: 16 }],
      },
    ],
  },
];
