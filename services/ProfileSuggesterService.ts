import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import axios, { AxiosRequestConfig } from 'axios'

export default class ProfileSuggesterService {
  private static instance: ProfileSuggesterService
  private static readonly API_URL = Env.get('PROFILE_SUGGESTER_API_URL')

  public static getInstance(): ProfileSuggesterService {
    if (!ProfileSuggesterService.instance) {
      ProfileSuggesterService.instance = new ProfileSuggesterService()
    }

    return ProfileSuggesterService.instance
  }

  public async getProfilesFromApi(user: User, profilesJson: any) {
    const requestOptions: AxiosRequestConfig = {
      method: 'POST',
      url: `${ProfileSuggesterService.API_URL}/find-similar-profiles`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        user: user,
        profiles: profilesJson,
      },
    }

    return await axios(requestOptions)
  }
}
