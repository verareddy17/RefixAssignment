// export class ResourceModel {
//     public ResourceID: number = 0;
//     public ResourceName: string = '';
//     public ParentFolderID: number = 0;
//     public ResourceType: string = '';
//     public ResourceImage: string = '';
//     public ResourceFolderImage: string = '';
//     public ResourcesCount: number = 0;
//     public Children: Array<SubResourceModel> = [];
// }

// export class SubResourceModel {
//     public ResourceID: number = 0;
//     public ResourceName: string = '';
//     public ResourceType: string = '';
//     public ParentFolderID: number = 0;
//     public ResourceFolderImage: string = '';
//     public ResourcesCount: number = 0;
//     public FileType: string = '';
//     public LauncherFile: string = '';
//     public ResourceSizeInKB: string = '';
//     public ResourceImage: string = '';
//     public ResourceFolderHierarchy: string = '';
//     public IsSendViaMail: boolean = false;
//     public SyncStatus: number = 0;
//     public UserStatus: number = 0;
//     public ResourceSequence: number = 0;
//     public Children: Array<SubResourceModel> = [];
// }
export class ResourceModel {
    public ResourceId: number = 0;
    public ResourceName: string = '';
    public ParentFolderId: number = 0;
    public ResourceType: string = '';
    public WBSCode: string = '';
    public ResourceImage?: string;
    public Children: Array<SubResourceModel> = [];
}

export class SubResourceModel {
    public ResourceId: number = 0;
    public ResourceName: string = '';
    public ParentFolderId: number = 0;
    public ResourceType: string = '';
    public WBSCode: string = '';
    public ResourceImage?: string;
    public ResourceSizeInKB: string = '';
    public LauncherFile: string = '';
    public IsSendViaMail: boolean = false;
    public Children: Array<SubResourceModel> = [];
}

