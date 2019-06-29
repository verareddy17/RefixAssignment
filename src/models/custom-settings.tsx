export class CustomizeSettings {
    public LandscapeImage?: string;
    public FontColor?: string;
    public HeaderColor?: string;
    public LogoImage?: string;
    public VersionNumber?: string;
    public PortraitImage?: string;
    public ConfirmationMessage?: string;
    public ConfirmationMessageModifiedDate?: string;
}

export interface Setting<T> {
    Settings: T;
}