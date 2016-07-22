import * as Contracts from "./contracts";

export interface IAuthenticatedRequest {
    session?: string;
    username?: string;
    password?: string;
}

export enum CreateRuntimeMapFeatureFlags {
    LayersAndGroups = 1,
    LayerIcons = 2,
    LayerFeatureSources = 4
}

export interface ICreateRuntimeMapOptions extends IAuthenticatedRequest {
    mapDefinition: Contracts.Common.ResourceIdentifier;
    requestedFeatures: number | CreateRuntimeMapFeatureFlags;
    iconsPerScaleRange?: number;
    iconFormat?: "PNG" | "PNG8" | "GIF" | "JPG";
    iconWidth?: number;
    iconHeight?: number;
}

export interface ISessionBasedRequest {
    session: string;
}

export interface IRuntimeMapRequest extends ISessionBasedRequest {
    mapname: string;
}

export enum QueryFeaturesSet {
    Attributes = 1,
    InlineSelection = 2,
    Tooltip = 4,
    Hyperlink = 8
}

export interface IQueryMapFeaturesOptions extends IRuntimeMapRequest {
    /**
     * A comma-seperated list of layer name to restrict the query on. Omit to
     * cover all selectable layers 
     * 
     * @type {string}
     */
    layernames?: string;
    /**
     * The WKT of the query geometry 
     * 
     * @type {string}
     */
    geometry?: string;
    /**
     * The spatial query operator to use with the input geometry 
     * 
     * @type {("INTERSECTS" | "TOUCHES" | "WITHIN" | "ENVELOPEINTERSECTS")}
     */
    selectionvariant?: "INTERSECTS" | "TOUCHES" | "WITHIN" | "ENVELOPEINTERSECTS";
    /**
     * A bitmask containing what features to ask for 
     * 
     * @type {QueryFeaturesSet}
     */
    requestdata?: QueryFeaturesSet;
    /**
     * The color of the selection 
     * 
     * @type {string}
     */
    selectioncolor?: string;
    /**
     * The image format of the requested selection image
     * 
     * @type {("PNG" | "JPG" | "GIF" | "PNG8")}
     */
    selectionformat?: "PNG" | "JPG" | "GIF" | "PNG8";
    /**
     * The maximum number of features to select. Use -1 for no limit. 
     * 
     * @type {number}
     */
    maxfeatures?: number;
    /**
     * 1 = Persist the query selection changes to the current selection set
     * 0 = The query selection does not modify the current selection set 
     * 
     * @type {number}
     */
    persist?: number;
}

export interface IDescribeRuntimeMapOptions extends IRuntimeMapRequest {

}

// Why does PromiseLike<T> not define catch() ?

/**
 * A promise-like interface
 */
export interface IPromise<T> {
    /**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 *
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): IPromise<U>;
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): IPromise<U>;

    /**
     * Sugar for promise.then(undefined, onRejected)
     *
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): IPromise<U>;
}

/**
 * Provides client services for a MapGuide map viewer 
 * 
 * @export
 * @interface IMapGuideClient
 */
export interface IMapGuideClient {
    /**
     * Retrieves the requested resource 
     * 
     * @abstract
     * @template T
     * @param {string} resourceId
     * @returns {PromiseLike<T>}
     */
    getResource<T extends Contracts.Resource.ResourceBase>(resourceId: Contracts.Common.ResourceIdentifier): IPromise<T>;

    /**
     * Creates a runtime map from the specified map definition
     * 
     * @abstract
     * @param {ICreateRuntimeMapOptions} options
     * @returns {PromiseLike<RtMap.RuntimeMap>}
     */
    createRuntimeMap(options: ICreateRuntimeMapOptions): IPromise<Contracts.RtMap.RuntimeMap>;

    /**
     * Performs a map selection query on the current map
     * 
     * @abstract
     * @param {IQueryMapFeaturesOptions} options
     * @returns {PromiseLike<Query.QueryMapFeaturesResponse>}
     */
    queryMapFeatures(options: IQueryMapFeaturesOptions): IPromise<Contracts.Query.QueryMapFeaturesResponse>;

    /**
     * Describes a runtime map 
     * 
     * @abstract
     * @param {IDescribeRuntimeMapOptions} options
     * @returns {PromiseLike<RtMap.RuntimeMap>}
     */
    describeRuntimeMap(options: IDescribeRuntimeMapOptions): IPromise<Contracts.RtMap.RuntimeMap>;

    /**
     * Gets the tile template URL used by the viewer to send tile requests
     * 
     * @param {string} resourceId
     * @param {string} groupName
     * @param {string} xPlaceholder
     * @param {string} yPlaceholder
     * @param {string} zPlaceholder
     * @returns {string}
     */
    getTileTemplateUrl(resourceId: string, groupName: string, xPlaceholder: string, yPlaceholder: string, zPlaceholder: string): string;
}

export abstract class RequestBuilder implements IMapGuideClient {
    protected agentUri: string;
    constructor(agentUri: string) {
        this.agentUri = agentUri;
    }

    public abstract getResource<T extends Contracts.Resource.ResourceBase>(resourceId: Contracts.Common.ResourceIdentifier): IPromise<T>;

    public abstract createRuntimeMap(options: ICreateRuntimeMapOptions): IPromise<Contracts.RtMap.RuntimeMap>;

    public abstract queryMapFeatures(options: IQueryMapFeaturesOptions): IPromise<Contracts.Query.QueryMapFeaturesResponse>;

    public abstract describeRuntimeMap(options: IDescribeRuntimeMapOptions): IPromise<Contracts.RtMap.RuntimeMap>;

    public abstract getTileTemplateUrl(resourceId: string, groupName: string, xPlaceholder: string, yPlaceholder: string, zPlaceholder: string): string;
}