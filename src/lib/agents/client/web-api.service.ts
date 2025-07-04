import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from "axios";

@Injectable()
export class WebApiServiceClient {

  private client: AxiosInstance;
  private headers: any = {'Content-Type':'application/json'};
  private baseUrl: string;

  constructor(){
    this.createClient() 
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.createClient();
  }

  setHeaders(headers: any) {
    this.headers = headers
    this.createClient();
  }

  createClient() {
    const axiosConfig: any = {}
    if(this.baseUrl) axiosConfig['baseURL'] = this.baseUrl;
    axiosConfig['headers'] = this.headers

    this.client = axios.create(axiosConfig) 
  }
      
  async post(endpoint:string, body:any):Promise<AxiosResponse>{

    return this.client({url: endpoint, method:'POST', data:body});
  }


  async get(endpoint:string):Promise<AxiosResponse>{
    return  this.client({url: endpoint, method: 'GET'});
  }


}
