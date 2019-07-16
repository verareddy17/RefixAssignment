
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

