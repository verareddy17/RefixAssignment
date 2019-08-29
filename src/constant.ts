import RNFetchBlob from 'rn-fetch-blob';
const dirs = RNFetchBlob.fs.dirs.DocumentDir;
import { Platform } from 'react-native';
import { SubResourceModel } from './models/resource-model';

export class Constant {
    public static activateAppURL = 'login';
    public static resourceUrl = 'GetAppResources';
    public static validationPin = 'Please Enter Valid Pin';
    public static downloadFile = 'GetResourceByIdAsStream';
    public static deviceTokenUrl = 'SaveDeviceToken';
    public static confirmationMessage = 'ConfirmationMessage';
    public static confirmationModifiedDate = 'ConfirmationMessageModifiedDate';
    public static blueColor = '#0000FF';
    public static blackColor = '#000000';
    public static bookmarks = 'bookmarks';
    public static bookmarkScreenHeaderTitle = 'Bookmarks';
    public static username = 'UserFullName';
    public static clientName = 'clientName';
    public static backgroundLandscapeImage = 'LandscapeImage';
    public static backgroundPortraitImage = 'PortraitImage';
    public static fontColor = 'FontColor';
    public static headerColor = 'HeaderColor';
    public static logoImage = 'LogoImage';
    public static versionNumber = 'VersionNumber';
    public static token = 'Token';
    public static landscape = 'LANDSCAPE';
    public static portrait = 'PORTRAIT';
    public static deviceToken = '631e592d49224abc1faa41e18833c5303fdc09ee45cfb8331dfaa65ada840331';
    public static resources = 'resources';
    public static downloadedFiles = 'downloadedFiles';
    public static allFiles = 'allFiles';
    public static addTitle = '   Add   ';
    public static removeTitle = '  Remove  ';
    public static addedbookmarkTitle = 'successfully added to bookmarks';
    public static deleted = 'successfully deleted the downloaded file';
    public static bookmarkDeleted = 'succesfully removed from bookmarks';
    public static noFiles = 'Please select at least one file';
    public static cancelDownload = 'Download canceled by user';
    public static indexHtml = 'index.html';
    public static loginName?: string;
    public static documentDir = dirs + '/MagnifiMobile';
    public static logoutTitle = 'Do you want to logout?';
    public static platform = Platform.OS ;
    public static deleteFile = 'file is not downloaded yet';
    public static deleteFilePath = Platform.OS === 'android' ? `file://${dirs}/${'MagnifiMobile'}` : `${dirs}/${'MagnifiMobile'}`;
    public static index: number = 0;
    public static content: string[] = [];
    public static navigationKey: string[] = [];
    public static networkConnctionFailed = 'No Internet Found';
    public static timeout = 60 * 1000;
    public static swipeButtonBackgroundColor = '#d11a2a';
    public static noInternetConnction = 'Please check internet connection';
    public static searchPlaceholder = 'Search file';
    public static customSettings = 'settings';
    public static userDetailes = 'userDetailes';
    public static userToken = 'userToken';
    public static portraitImagePath = '';
    public static landscapeImagePath = '';
    public static bearerToken = '';
    public static headerFontColor?: string;
    public static deviceOS = Platform.OS === 'ios' ? 1 : 0;
    public static fetchAllFiles: SubResourceModel[] = [];
    public static whiteColor = '#ffffff';
    public static transparentColor = 'transparent';
    public static successfullyDownloaded = 'Successfully downloaded';
}

export enum FileType {
    zip = '.zip',
    video = '.mp4',
    jpg = '.jpg',
    pptx = '.pptx',
    xlsx = '.xlsx',
    docx = '.docx',
    pdf = '.pdf',
    png = '.png',
    ppt = '.ppt',
    doc = '.doc',
    xls = '.xls',
}