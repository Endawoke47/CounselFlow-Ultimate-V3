import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesController } from './controllers/cities.controller';
import { CountriesController } from './controllers/countries.controller';
import { StatesController } from './controllers/states.controller';
import { City } from './entities/city.entity';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { CitiesService } from './services/cities.service';
import { CountriesService } from './services/countries.service';
import { StatesService } from './services/states.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country, State, City])],
  controllers: [CountriesController, StatesController, CitiesController],
  providers: [CountriesService, StatesService, CitiesService],
  exports: [CountriesService, StatesService, CitiesService],
})
export class GeoModule {}
