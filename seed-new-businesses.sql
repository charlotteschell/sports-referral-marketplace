-- Seed new businesses across key endurance sports hubs
-- Sport Categories: 1=Cycling, 2=Running, 3=Snowsports, 4=Sport Vacations
-- Business Types: 1=Coach, 2=Nutritionist, 3=Personal Trainer, 4=Cycling Studio, 5=Running Club, 6=Cycling Club, 7=Bike Shop, 8=Runner Store, 9=Physio Therapist, 10=Sport Massage Therapist, 11=Vacation Provider

-- ═══════════════════════════════════════════════════
-- EUROPEAN HUBS - Dolomites, Pyrenees, Mallorca, Alps
-- ═══════════════════════════════════════════════════

-- Dolomites, Italy
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Dolomiti Cycling Tours', 'dolomiti-cycling-tours', 'Premium guided cycling tours through the legendary Dolomite passes. Multi-day packages with hotel accommodation, support vehicles, and expert guides for all levels.', 'Guided cycling tours through iconic Dolomite passes', 1, 11, 'Cortina d''Ampezzo', 'Veneto', 'Italy', 'Dolomites', 'Cortina d''Ampezzo', true, true),
('Alta Via Running Camp', 'alta-via-running-camp', 'Trail and ultra running training camps along the famous Alta Via routes. Professional coaching, nutrition planning, and mountain running technique workshops.', 'Trail & ultra running camps in the Dolomites', 2, 11, 'Bolzano', 'South Tyrol', 'Italy', 'Dolomites', 'Bolzano', true, true),
('Dolomites Sport Physio', 'dolomites-sport-physio', 'Specialized sports physiotherapy for endurance athletes. Recovery protocols, injury prevention, and performance optimization in the heart of the Dolomites.', 'Sports physio for endurance athletes in the Dolomites', 1, 9, 'Bressanone', 'South Tyrol', 'Italy', 'Dolomites', 'Bressanone', true, false),
('Val Gardena Bike Shop', 'val-gardena-bike-shop', 'Full-service bike shop in Val Gardena offering road and gravel bike rentals, professional fitting, and guided ride recommendations through the Dolomite valleys.', 'Bike rentals and service in Val Gardena', 1, 7, 'Ortisei', 'South Tyrol', 'Italy', 'Dolomites', 'Val Gardena', true, false),
('Dolomiti Ski & Snow', 'dolomiti-ski-snow', 'Ski and snowboard instruction, backcountry touring, and nordic skiing programs across the Dolomiti Superski region. All levels from beginner to expert.', 'Ski instruction and backcountry touring in the Dolomites', 3, 1, 'Selva di Val Gardena', 'South Tyrol', 'Italy', 'Dolomites', 'Val Gardena', true, true);

-- Pyrenees, France/Spain
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Pyrenees Cycling Holidays', 'pyrenees-cycling-holidays', 'Ride the legendary Tour de France cols. Guided and self-guided cycling holidays through the French and Spanish Pyrenees with charming accommodation.', 'Cycling holidays through Tour de France cols', 1, 11, 'Luchon', 'Occitanie', 'France', 'Pyrenees', 'Luchon', true, true),
('Trail Pyrenees', 'trail-pyrenees', 'Trail running and ultra running camps in the Pyrenees. GR10 and GR11 guided runs, altitude training, and race preparation for UTMB and other European ultras.', 'Trail running camps and guided ultra runs', 2, 11, 'Cauterets', 'Occitanie', 'France', 'Pyrenees', 'Cauterets', true, false),
('Pyrenees Performance Coaching', 'pyrenees-performance-coaching', 'Altitude training and endurance coaching for cyclists and runners. Personalized programs using the natural altitude of the Pyrenees for performance gains.', 'Altitude training and endurance coaching', 1, 1, 'Font-Romeu', 'Occitanie', 'France', 'Pyrenees', 'Font-Romeu', true, false),
('Andorra Sport Nutrition', 'andorra-sport-nutrition', 'Sports nutrition consulting for endurance athletes training in the Pyrenees. Altitude nutrition, race-day fueling strategies, and recovery protocols.', 'Sports nutrition for altitude training athletes', 2, 2, 'Andorra la Vella', '', 'Andorra', 'Pyrenees', 'Andorra', true, false);

-- Mallorca, Spain
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Mallorca Cycling Camp', 'mallorca-cycling-camp', 'The ultimate cycling destination. Professional training camps with coached rides, bike fitting, and performance testing on Mallorca''s world-famous roads.', 'Professional cycling training camps in Mallorca', 1, 11, 'Palma', 'Balearic Islands', 'Spain', 'Mallorca', 'Palma', true, true),
('Sa Calobra Bike Rentals', 'sa-calobra-bike-rentals', 'Premium road and gravel bike rentals in Mallorca. Delivery to your hotel, professional fitting, and route planning for the best rides on the island.', 'Premium bike rentals with hotel delivery', 1, 7, 'Port de Pollença', 'Balearic Islands', 'Spain', 'Mallorca', 'Port de Pollença', true, false),
('Mallorca Running Retreats', 'mallorca-running-retreats', 'Running retreats combining trail running along the Serra de Tramuntana with yoga, nutrition workshops, and Mediterranean wellness. All levels welcome.', 'Trail running retreats with wellness focus', 2, 11, 'Sóller', 'Balearic Islands', 'Spain', 'Mallorca', 'Sóller', true, false),
('Tramuntana Trail Coach', 'tramuntana-trail-coach', 'Expert trail running coaching in the Serra de Tramuntana mountains. Technical trail skills, race preparation, and guided runs through Mallorca''s most scenic trails.', 'Trail running coaching in Serra de Tramuntana', 2, 1, 'Deià', 'Balearic Islands', 'Spain', 'Mallorca', 'Deià', true, false);

-- Swiss/French Alps
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Chamonix Endurance', 'chamonix-endurance', 'UTMB preparation camps, trail running coaching, and mountain endurance training in the shadow of Mont Blanc. Home of the world''s most famous ultra.', 'UTMB prep camps and trail running coaching', 2, 11, 'Chamonix', 'Auvergne-Rhône-Alpes', 'France', 'Alps', 'Chamonix', true, true),
('Zermatt Ski Academy', 'zermatt-ski-academy', 'Year-round skiing instruction at the foot of the Matterhorn. Alpine, nordic, and ski touring programs with certified Swiss instructors.', 'Year-round ski instruction at the Matterhorn', 3, 1, 'Zermatt', 'Valais', 'Switzerland', 'Alps', 'Zermatt', true, false),
('Girona Cycling Hub', 'girona-cycling-hub', 'The European cycling capital. Coaching, group rides, bike services, and connections to the vibrant pro cycling community based in Girona.', 'Cycling coaching and community in the European cycling capital', 1, 1, 'Girona', 'Catalonia', 'Spain', 'Costa Brava', 'Girona', true, true),
('Nice Côte d''Azur Cycling', 'nice-cote-dazur-cycling', 'Road cycling tours and training camps along the French Riviera. Ride the cols of the Alpes-Maritimes and enjoy Mediterranean climate year-round.', 'Cycling tours along the French Riviera', 1, 11, 'Nice', 'Provence-Alpes-Côte d''Azur', 'France', 'French Riviera', 'Nice', true, false);

-- Nordic/Scandinavia
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Nordic Ski Norway', 'nordic-ski-norway', 'Cross-country skiing and biathlon training in the Norwegian heartland. Professional coaching, waxing clinics, and guided tours through pristine Nordic landscapes.', 'Cross-country skiing and biathlon training', 3, 1, 'Lillehammer', 'Innlandet', 'Norway', 'Scandinavia', 'Lillehammer', true, false);

-- ═══════════════════════════════════════════════════
-- NORTH AMERICAN HUBS
-- ═══════════════════════════════════════════════════

-- Canada - British Columbia
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Squamish Trail Running Co', 'squamish-trail-running-co', 'Trail running coaching and guided runs in the Sea-to-Sky corridor. From technical single track to alpine ridge runs, explore BC''s best trails with expert guides.', 'Trail running coaching in the Sea-to-Sky corridor', 2, 1, 'Squamish', 'British Columbia', 'Canada', 'Western Canada', 'Squamish', true, false),
('Whistler Endurance Sports', 'whistler-endurance-sports', 'Multi-sport vacation packages in Whistler. Summer cycling and trail running, winter skiing and snowboarding. Year-round endurance sport experiences.', 'Multi-sport vacation packages year-round', 4, 11, 'Whistler', 'British Columbia', 'Canada', 'Western Canada', 'Whistler', true, true),
('Victoria Cycling Club', 'victoria-cycling-club', 'Community cycling club on Vancouver Island. Group rides, racing programs, and social events for road, gravel, and mountain cyclists of all abilities.', 'Community cycling club on Vancouver Island', 1, 6, 'Victoria', 'British Columbia', 'Canada', 'Western Canada', 'Victoria', true, false);

-- Canada - Alberta
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Canmore Trail Culture', 'canmore-trail-culture', 'Trail running community and coaching in the Canadian Rockies. Group runs, race training, and mountain running technique clinics in Canmore and Banff.', 'Trail running community in the Canadian Rockies', 2, 5, 'Canmore', 'Alberta', 'Canada', 'Western Canada', 'Canmore', true, true),
('Banff Sport Massage', 'banff-sport-massage', 'Deep tissue and sport massage therapy for endurance athletes. Recovery sessions, pre-race preparation, and ongoing maintenance programs.', 'Sport massage therapy for endurance athletes', 2, 10, 'Banff', 'Alberta', 'Canada', 'Western Canada', 'Banff', true, false),
('Lake Louise Ski School', 'lake-louise-ski-school', 'Ski and snowboard instruction at Lake Louise. Private and group lessons, backcountry touring, and avalanche safety courses in the Canadian Rockies.', 'Ski instruction and backcountry touring', 3, 1, 'Lake Louise', 'Alberta', 'Canada', 'Western Canada', 'Lake Louise', true, false);

-- US - Colorado
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Leadville Ultra Coaching', 'leadville-ultra-coaching', 'Ultra running coaching specializing in high-altitude races. Leadville 100, Hardrock 100, and other Colorado ultra preparation with altitude-specific training.', 'Ultra running coaching for high-altitude races', 2, 1, 'Leadville', 'Colorado', 'US', 'Western US', 'Leadville', true, false),
('Vail Sport Vacations', 'vail-sport-vacations', 'Year-round sport vacation packages in Vail. Winter skiing and snowboarding, summer cycling and trail running. Luxury accommodation with guided activities.', 'Year-round sport vacation packages', 4, 11, 'Vail', 'Colorado', 'US', 'Western US', 'Vail', true, true),
('Denver Running Collective', 'denver-running-collective', 'Running club and coaching for all distances. Road running, trail running, and ultra running programs. Weekly group runs and race preparation in the Mile High City.', 'Running club and coaching for all distances', 2, 5, 'Denver', 'Colorado', 'US', 'Western US', 'Denver', true, false),
('Durango Cycling Performance', 'durango-cycling-performance', 'Professional cycling coaching in Durango, a legendary cycling town. Road, gravel, and mountain bike coaching with power-based training and race strategy.', 'Professional cycling coaching in a legendary cycling town', 1, 1, 'Durango', 'Colorado', 'US', 'Western US', 'Durango', true, false);

-- US - California
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Marin Trail Running', 'marin-trail-running', 'Trail running coaching and guided runs in Marin County. From Mt. Tamalpais to Muir Woods, explore the birthplace of trail running with expert guides.', 'Trail running in the birthplace of trail running', 2, 1, 'Mill Valley', 'California', 'US', 'Western US', 'Marin County', true, false),
('Tahoe Endurance Sports', 'tahoe-endurance-sports', 'Multi-sport endurance vacation packages at Lake Tahoe. Summer trail running and cycling, winter skiing and snowshoeing. Altitude training at 6,200 feet.', 'Multi-sport endurance vacations at Lake Tahoe', 4, 11, 'South Lake Tahoe', 'California', 'US', 'Western US', 'Lake Tahoe', true, false),
('Santa Cruz Bike Works', 'santa-cruz-bike-works', 'Full-service bike shop specializing in road, gravel, and mountain bikes. Professional fitting, custom builds, and group rides along the California coast.', 'Full-service bike shop on the California coast', 1, 7, 'Santa Cruz', 'California', 'US', 'Western US', 'Santa Cruz', true, false);

-- US - Pacific Northwest
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Seattle Running Company', 'seattle-running-company', 'Running store and community hub in Seattle. Expert shoe fitting, gait analysis, group runs, and coaching programs for road and trail runners.', 'Running store and community hub', 2, 8, 'Seattle', 'Washington', 'US', 'Western US', 'Seattle', true, false),
('Hood River Cycling', 'hood-river-cycling', 'Cycling coaching and tours in the Columbia River Gorge. Road cycling, gravel riding, and multi-day tours through Oregon''s most scenic cycling region.', 'Cycling coaching and tours in the Columbia River Gorge', 1, 1, 'Hood River', 'Oregon', 'US', 'Western US', 'Hood River', true, false);

-- US - Northeast
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Vermont Ski & Run', 'vermont-ski-run', 'Year-round endurance sport vacations in Vermont. Winter nordic and alpine skiing, summer trail running and cycling through the Green Mountains.', 'Year-round endurance sport vacations', 4, 11, 'Stowe', 'Vermont', 'US', 'Eastern US', 'Stowe', true, false),
('Boston Marathon Coaching', 'boston-marathon-coaching', 'Marathon and road running coaching with a focus on Boston Marathon qualification. Structured training plans, group runs, and race-day strategy.', 'Marathon coaching focused on Boston qualification', 2, 1, 'Boston', 'Massachusetts', 'US', 'Eastern US', 'Boston', true, false);

-- US - Southwest
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Sedona Trail Adventures', 'sedona-trail-adventures', 'Trail running retreats and guided runs through Sedona''s red rock landscape. Combine running with yoga, nutrition workshops, and desert wellness.', 'Trail running retreats in red rock country', 2, 11, 'Sedona', 'Arizona', 'US', 'Western US', 'Sedona', true, true),
('Tucson Cycling Camp', 'tucson-cycling-camp', 'Winter cycling training camps in sunny Tucson. Professional coaching, group rides, and performance testing. The perfect escape for northern cyclists.', 'Winter cycling training camps in sunny Tucson', 1, 11, 'Tucson', 'Arizona', 'US', 'Western US', 'Tucson', true, false);

-- Canada - Eastern
INSERT INTO businesses (name, slug, description, shortDescription, sportCategoryId, businessTypeId, city, state, country, region, hub, isActive, isFeatured) VALUES
('Mont-Tremblant Sport', 'mont-tremblant-sport', 'Multi-sport vacation packages at Mont-Tremblant. Winter skiing and snowboarding, summer cycling and trail running in the Laurentian Mountains.', 'Multi-sport vacations in the Laurentians', 4, 11, 'Mont-Tremblant', 'Quebec', 'Canada', 'Eastern Canada', 'Mont-Tremblant', true, false),
('Ottawa Running Room', 'ottawa-running-room', 'Running coaching and community for all levels. Marathon training, trail running groups, and winter running programs in Canada''s capital.', 'Running coaching and community for all levels', 2, 5, 'Ottawa', 'Ontario', 'Canada', 'Eastern Canada', 'Ottawa', true, false);
