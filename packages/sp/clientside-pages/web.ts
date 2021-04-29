import { _Web, IWeb } from "../webs/types.js";
import { IClientsidePageComponent, CreateClientsidePage, IClientsidePage, ClientsidePageLayoutType, ClientsidePageFromFile, PromotedState, IRepostPage } from "./types.js";
import { SharePointQueryableInstance, SharePointQueryableCollection } from "../sharepointqueryable.js";
import { extractWebUrl } from "../utils/extractweburl.js";
import { spPost } from "../operations.js";
import { body } from "@pnp/odata";
import { metadata } from "../utils/metadata.js";
import { assign } from "@pnp/common";

declare module "../webs/types" {
    interface _Web {
        getClientsideWebParts(): Promise<IClientsidePageComponent[]>;
        addClientsidePage(pageName: string, title?: string, libraryTitle?: string, promotedState?: PromotedState): Promise<IClientsidePage>;
        loadClientsidePage(path: string): Promise<IClientsidePage>;
        addRepostPage(details: IRepostPage): Promise<string>;
    }
    interface IWeb {

        /**
         * Gets the collection of available client side web parts for this web instance
         */
        getClientsideWebParts(): Promise<IClientsidePageComponent[]>;

        /**
         * Creates a new client side page
         *
         * @param pageName Name of the new page
         * @param title Display title of the new page
         */
        addClientsidePage(pageName: string, title?: string, PageLayoutType?: ClientsidePageLayoutType, promotedState?: PromotedState): Promise<IClientsidePage>;

        /**
         * Loads a page from the provided server relative path to the file
         *
         * @param path Server relative path to the file (ex: "/sites/dev/sitepages/page.aspx")
         */
        loadClientsidePage(path: string): Promise<IClientsidePage>;

        /**
         * Adds a repost page
         *
         * @param details The request details to create the page
         */
        addRepostPage(details: IRepostPage): Promise<string>;
    }
}

_Web.prototype.getClientsideWebParts = function (): Promise<IClientsidePageComponent[]> {
    return this.clone(SharePointQueryableCollection, "GetClientSideWebParts")();
};

_Web.prototype.addClientsidePage =
    function (this: IWeb, pageName: string, title = pageName.replace(/\.[^/.]+$/, ""), layout?: ClientsidePageLayoutType, promotedState?: PromotedState): Promise<IClientsidePage> {
        return CreateClientsidePage(this, pageName, title, layout, promotedState);
    };

_Web.prototype.loadClientsidePage = function (this: IWeb, path: string): Promise<IClientsidePage> {
    return ClientsidePageFromFile(this.getFileByServerRelativePath(path));
};

_Web.prototype.addRepostPage = async function (this: IWeb, details: IRepostPage): Promise<string> {

    const query = SharePointQueryableInstance(extractWebUrl(this.toUrl()), "_api/sitepages/pages/reposts").configureFrom(this);
    const r: { AbsoluteUrl: string } = await spPost(query, body(assign(metadata("SP.Publishing.RepostPage"), details)));
    return r.AbsoluteUrl;
};
