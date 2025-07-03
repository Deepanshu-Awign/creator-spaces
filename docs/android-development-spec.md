
# Native Android App Development Specification
## Studio Booking Platform

### Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Database Integration](#database-integration)
5. [API Integration](#api-integration)
6. [UI/UX Design](#ui-ux-design)
7. [Security & Authentication](#security--authentication)
8. [Mobile-Specific Features](#mobile-specific-features)
9. [Performance Optimization](#performance-optimization)
10. [Project Structure](#project-structure)
11. [Development Guidelines](#development-guidelines)

---

## Project Overview

### Purpose
Develop a native Android application for the studio booking platform that provides a premium mobile experience while maintaining full compatibility with the existing web application and Supabase database.

### Key Objectives
- **Native Performance**: Smooth, responsive user interface with native Android components
- **Offline Functionality**: Local caching for essential data and offline browsing
- **Enhanced Mobile UX**: Mobile-optimized workflows and interactions
- **Seamless Integration**: Share the same backend and user accounts with the web app
- **Modern Architecture**: Clean, maintainable code following Android best practices

---

## Core Features

### 1. Authentication & Onboarding
- **Social Login**: Google Sign-In integration
- **Email/Password**: Traditional authentication with Supabase Auth
- **Onboarding Flow**: Welcome screens with feature highlights
- **Profile Setup**: Initial profile creation with photo upload

### 2. Studio Discovery
- **Search & Filter**: Advanced search with multiple filter options
- **Location-Based**: GPS integration for nearby studios
- **Map View**: Interactive map showing studio locations
- **Favorites**: Save and manage favorite studios
- **Categories**: Browse by studio type, amenities, price range

### 3. Studio Details & Booking
- **Studio Gallery**: High-quality image carousel with zoom
- **Detailed Information**: Description, amenities, host details, reviews
- **Availability Calendar**: Real-time availability checking
- **Booking Flow**: Streamlined booking process with date/time selection
- **Payment Integration**: Secure payment processing

### 4. User Profile & Management
- **Profile Management**: Edit personal information and preferences
- **Booking History**: View past and upcoming bookings
- **Favorites**: Manage saved studios
- **Notifications**: Push notifications for booking updates
- **Settings**: App preferences and account settings

### 5. Communication
- **Host Contact**: Direct messaging with studio hosts
- **Support**: In-app support and help center
- **Reviews**: Leave and manage reviews for completed bookings

---

## Technical Architecture

### Technology Stack
```kotlin
// Core Technologies
- Language: Kotlin
- UI Framework: Jetpack Compose
- Architecture: MVVM + Clean Architecture
- Dependency Injection: Hilt
- Navigation: Navigation Compose
- State Management: StateFlow + Compose State

// Backend Integration
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Real-time: Supabase Realtime

// Local Storage
- Database: Room
- Preferences: DataStore
- Caching: Room + Memory Cache

// Networking
- HTTP Client: Ktor Client
- Image Loading: Coil
- JSON Parsing: Kotlinx Serialization

// Location & Maps
- Maps: Google Maps SDK
- Location: Fused Location Provider
- Geofencing: Location APIs

// Payments
- Payment Gateway: Razorpay Android SDK
- Security: Android Keystore

// Testing
- Unit Tests: JUnit 5, Mockk
- UI Tests: Compose Test
- Integration Tests: Hilt Testing
```

### Architecture Layers

#### 1. Presentation Layer (UI)
```kotlin
// Composable Screens
@Composable
fun StudioListScreen(
    viewModel: StudioListViewModel = hiltViewModel(),
    onStudioClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LazyColumn {
        items(uiState.studios) { studio ->
            StudioCard(
                studio = studio,
                onFavoriteClick = viewModel::toggleFavorite,
                onClick = { onStudioClick(studio.id) }
            )
        }
    }
}

// ViewModels
@HiltViewModel
class StudioListViewModel @Inject constructor(
    private val studioRepository: StudioRepository,
    private val locationRepository: LocationRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(StudioListUiState())
    val uiState = _uiState.asStateFlow()
    
    fun loadStudios(searchQuery: String = "") {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val studios = studioRepository.getStudios(searchQuery)
                _uiState.value = _uiState.value.copy(
                    studios = studios,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message,
                    isLoading = false
                )
            }
        }
    }
}
```

#### 2. Domain Layer (Business Logic)
```kotlin
// Use Cases
class GetStudiosUseCase @Inject constructor(
    private val studioRepository: StudioRepository
) {
    suspend operator fun invoke(params: GetStudiosParams): Result<List<Studio>> {
        return try {
            val studios = studioRepository.getStudios(
                city = params.city,
                latitude = params.latitude,
                longitude = params.longitude,
                filters = params.filters
            )
            Result.success(studios)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// Domain Models
data class Studio(
    val id: String,
    val title: String,
    val description: String,
    val location: String,
    val latitude: Double?,
    val longitude: Double?,
    val pricePerHour: Int,
    val rating: Float,
    val totalReviews: Int,
    val images: List<String>,
    val amenities: List<String>,
    val host: Host,
    val isActive: Boolean,
    val distance: Double? = null
)

// Repository Interfaces
interface StudioRepository {
    suspend fun getStudios(
        city: String? = null,
        latitude: Double? = null,
        longitude: Double? = null,
        filters: StudioFilters? = null
    ): List<Studio>
    
    suspend fun getStudioById(id: String): Studio?
    suspend fun toggleFavorite(studioId: String): Boolean
    suspend fun getFavorites(): List<Studio>
}
```

#### 3. Data Layer (Repository Implementation)
```kotlin
@Singleton
class StudioRepositoryImpl @Inject constructor(
    private val remoteDataSource: StudioRemoteDataSource,
    private val localDataSource: StudioLocalDataSource,
    private val networkConnectivity: NetworkConnectivity
) : StudioRepository {
    
    override suspend fun getStudios(
        city: String?,
        latitude: Double?,
        longitude: Double?,
        filters: StudioFilters?
    ): List<Studio> {
        return if (networkConnectivity.isConnected()) {
            // Fetch from remote and cache locally
            val remoteStudios = remoteDataSource.getStudios(city, latitude, longitude, filters)
            localDataSource.cacheStudios(remoteStudios)
            remoteStudios
        } else {
            // Return cached data
            localDataSource.getCachedStudios()
        }
    }
}

// Remote Data Source (Supabase)
@Singleton
class StudioRemoteDataSource @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val httpClient: HttpClient
) {
    suspend fun getStudios(
        city: String?,
        latitude: Double?,
        longitude: Double?,
        filters: StudioFilters?
    ): List<Studio> {
        val response = httpClient.get("${supabaseClient.supabaseUrl}/functions/v1/mobile-studios") {
            parameter("city", city)
            parameter("latitude", latitude)
            parameter("longitude", longitude)
            filters?.let { 
                parameter("minPrice", it.minPrice)
                parameter("maxPrice", it.maxPrice)
                parameter("amenities", it.amenities.joinToString(","))
            }
        }
        
        return response.body<StudiosResponse>().studios.map { it.toDomain() }
    }
}

// Local Data Source (Room)
@Dao
interface StudioDao {
    @Query("SELECT * FROM studios WHERE isActive = 1")
    suspend fun getAllStudios(): List<StudioEntity>
    
    @Query("SELECT * FROM studios WHERE id = :id")
    suspend fun getStudioById(id: String): StudioEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudios(studios: List<StudioEntity>)
    
    @Query("DELETE FROM studios")
    suspend fun clearAll()
}
```

---

## Database Integration

### Supabase Configuration
```kotlin
// Supabase Client Setup
@Module
@InstallIn(SingletonComponent::class)
object SupabaseModule {
    
    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            install(Auth) {
                scheme = "app"
                host = "supabase.com"
            }
            install(Realtime)
            install(Storage)
        }
    }
    
    @Provides
    @Singleton
    fun provideSupabaseAuth(client: SupabaseClient): GoTrueClient {
        return client.auth
    }
}
```

### Local Database (Room)
```kotlin
// Database Entities
@Entity(tableName = "studios")
data class StudioEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val location: String,
    val city: String?,
    val state: String?,
    val latitude: Double?,
    val longitude: Double?,
    val pricePerHour: Int,
    val rating: Float,
    val totalReviews: Int,
    val images: List<String>,
    val amenities: List<String>,
    val tags: List<String>,
    val hostId: String,
    val hostName: String,
    val hostAvatar: String?,
    val isActive: Boolean,
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "bookings")
data class BookingEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val studioId: String,
    val studioTitle: String,
    val bookingDate: String,
    val startTime: String,
    val durationHours: Int,
    val totalPrice: Int,
    val status: String,
    val paymentStatus: String,
    val guestCount: Int,
    val specialRequests: String?,
    val createdAt: String,
    val updatedAt: String
)

// Room Database
@Database(
    entities = [StudioEntity::class, BookingEntity::class, FavoriteEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun studioDao(): StudioDao
    abstract fun bookingDao(): BookingDao
    abstract fun favoriteDao(): FavoriteDao
}
```

### Real-time Subscriptions
```kotlin
@Singleton
class RealtimeManager @Inject constructor(
    private val supabaseClient: SupabaseClient
) {
    
    fun subscribeToBookingUpdates(userId: String, onUpdate: (Booking) -> Unit) {
        supabaseClient.realtime.createChannel("booking_updates_$userId")
            .postgresChangeFilter(
                schema = "public",
                table = "bookings",
                filter = "user_id=eq.$userId"
            ) { payload ->
                when (payload.eventType) {
                    EventType.INSERT, EventType.UPDATE -> {
                        payload.decodeRecord<BookingDto>()?.let { bookingDto ->
                            onUpdate(bookingDto.toDomain())
                        }
                    }
                }
            }
            .subscribe()
    }
}
```

---

## API Integration

### HTTP Client Configuration
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideHttpClient(
        supabaseClient: SupabaseClient
    ): HttpClient {
        return HttpClient(Android) {
            install(ContentNegotiation) {
                json(Json {
                    isLenient = true
                    ignoreUnknownKeys = true
                })
            }
            
            install(Logging) {
                logger = Logger.ANDROID
                level = LogLevel.INFO
            }
            
            install(DefaultRequest) {
                header("apikey", BuildConfig.SUPABASE_ANON_KEY)
                header("Authorization", "Bearer ${BuildConfig.SUPABASE_ANON_KEY}")
            }
            
            install(HttpTimeout) {
                requestTimeoutMillis = 30000
                connectTimeoutMillis = 30000
                socketTimeoutMillis = 30000
            }
        }
    }
}
```

### API Service Implementation
```kotlin
interface ApiService {
    
    @GET("functions/v1/mobile-studios")
    suspend fun getStudios(
        @Query("city") city: String? = null,
        @Query("latitude") latitude: Double? = null,
        @Query("longitude") longitude: Double? = null,
        @Query("radius") radius: Double? = null,
        @Query("minPrice") minPrice: Int? = null,
        @Query("maxPrice") maxPrice: Int? = null,
        @Query("amenities") amenities: String? = null,
        @Query("sortBy") sortBy: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): StudiosResponse
    
    @POST("functions/v1/mobile-booking")
    suspend fun createBooking(@Body booking: CreateBookingRequest): BookingResponse
    
    @GET("functions/v1/mobile-booking")
    suspend fun getUserBookings(
        @Query("userId") userId: String,
        @Query("status") status: String? = null
    ): BookingsResponse
    
    @GET("functions/v1/mobile-profile")
    suspend fun getUserProfile(@Query("userId") userId: String): ProfileResponse
    
    @PUT("functions/v1/mobile-profile")
    suspend fun updateProfile(
        @Query("userId") userId: String,
        @Body profile: UpdateProfileRequest
    ): ProfileResponse
}
```

---

## UI/UX Design

### Design System
```kotlin
// Theme Configuration
@Composable
fun StudioBookingTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = Color(0xFFFF6B35),
            secondary = Color(0xFF03DAC6),
            background = Color(0xFF121212),
            surface = Color(0xFF1E1E1E)
        )
    } else {
        lightColorScheme(
            primary = Color(0xFFFF6B35),
            secondary = Color(0xFF03DAC6),
            background = Color(0xFFFFFBFE),
            surface = Color(0xFFFFFBFE)
        )
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}

// Custom Components
@Composable
fun StudioCard(
    studio: Studio,
    onFavoriteClick: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column {
            // Studio Image
            AsyncImage(
                model = studio.images.firstOrNull(),
                contentDescription = studio.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentScale = ContentScale.Crop
            )
            
            // Studio Details
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = studio.title,
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.weight(1f)
                    )
                    
                    IconButton(onClick = onFavoriteClick) {
                        Icon(
                            imageVector = if (studio.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (studio.isFavorite) Color.Red else Color.Gray
                        )
                    }
                }
                
                // Location
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Color.Gray
                    )
                    Text(
                        text = studio.location,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        modifier = Modifier.padding(start = 4.dp)
                    )
                }
                
                // Rating and Price
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFFFFD700)
                        )
                        Text(
                            text = "${studio.rating} (${studio.totalReviews})",
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(start = 4.dp)
                        )
                    }
                    
                    Text(
                        text = "₹${studio.pricePerHour}/hour",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}
```

### Screen Implementations

#### 1. Home Screen
```kotlin
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onStudioClick: (String) -> Unit,
    onSearchClick: () -> Unit,
    onSeeAllClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            HomeHeader(
                userGreeting = "Hello, ${uiState.userName}!",
                onSearchClick = onSearchClick
            )
        }
        
        // Featured Studios
        item {
            SectionHeader(
                title = "Featured Studios",
                onSeeAllClick = { onSeeAllClick("featured") }
            )
        }
        
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                items(uiState.featuredStudios) { studio ->
                    StudioCard(
                        studio = studio,
                        onFavoriteClick = { viewModel.toggleFavorite(studio.id) },
                        onClick = { onStudioClick(studio.id) },
                        modifier = Modifier.width(280.dp)
                    )
                }
            }
        }
        
        // Nearby Studios
        item {
            SectionHeader(
                title = "Nearby Studios",
                onSeeAllClick = { onSeeAllClick("nearby") }
            )
        }
        
        items(uiState.nearbyStudios) { studio ->
            StudioCard(
                studio = studio,
                onFavoriteClick = { viewModel.toggleFavorite(studio.id) },
                onClick = { onStudioClick(studio.id) }
            )
        }
    }
}
```

#### 2. Studio Detail Screen
```kotlin
@Composable
fun StudioDetailScreen(
    studioId: String,
    viewModel: StudioDetailViewModel = hiltViewModel(),
    onBackClick: () -> Unit,
    onBookNowClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(studioId) {
        viewModel.loadStudio(studioId)
    }
    
    when {
        uiState.isLoading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        
        uiState.studio != null -> {
            val studio = uiState.studio!!
            
            LazyColumn(
                modifier = Modifier.fillMaxSize()
            ) {
                // Image Gallery
                item {
                    ImageGallery(
                        images = studio.images,
                        onBackClick = onBackClick,
                        onFavoriteClick = { viewModel.toggleFavorite() },
                        isFavorite = studio.isFavorite
                    )
                }
                
                // Studio Info
                item {
                    StudioInfo(
                        studio = studio,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                
                // Amenities
                item {
                    AmenitiesSection(
                        amenities = studio.amenities,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
                
                // Host Info
                item {
                    HostSection(
                        host = studio.host,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                
                // Reviews
                item {
                    ReviewsSection(
                        reviews = uiState.reviews,
                        rating = studio.rating,
                        totalReviews = studio.totalReviews,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
                
                // Bottom spacing for FAB
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
            
            // Book Now FAB
            FloatingActionButton(
                onClick = onBookNowClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Book Now - ₹${studio.pricePerHour}/hour",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White
                    )
                }
            }
        }
        
        uiState.error.isNotEmpty() -> {
            ErrorScreen(
                message = uiState.error,
                onRetryClick = { viewModel.loadStudio(studioId) }
            )
        }
    }
}
```

---

## Security & Authentication

### Authentication Implementation
```kotlin
@Singleton
class AuthRepository @Inject constructor(
    private val supabaseAuth: GoTrueClient,
    private val preferencesManager: PreferencesManager
) {
    
    suspend fun signInWithEmail(email: String, password: String): Result<User> {
        return try {
            val result = supabaseAuth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            
            result.user?.let { user ->
                preferencesManager.saveUserSession(user.id, user.email)
                Result.success(user.toDomain())
            } ?: Result.failure(Exception("Sign in failed"))
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signInWithGoogle(idToken: String): Result<User> {
        return try {
            val result = supabaseAuth.signInWith(IDToken) {
                this.idToken = idToken
                provider = Google
            }
            
            result.user?.let { user ->
                preferencesManager.saveUserSession(user.id, user.email)
                Result.success(user.toDomain())
            } ?: Result.failure(Exception("Google sign in failed"))
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signOut(): Result<Unit> {
        return try {
            supabaseAuth.signOut()
            preferencesManager.clearUserSession()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCurrentUser(): Flow<User?> {
        return supabaseAuth.sessionStatus.map { status ->
            when (status) {
                is SessionStatus.Authenticated -> status.session.user?.toDomain()
                else -> null
            }
        }
    }
}
```

### Security Best Practices
```kotlin
// API Key Management
object SecurityConfig {
    // Store sensitive keys in BuildConfig (generated from gradle.properties)
    const val SUPABASE_URL = BuildConfig.SUPABASE_URL
    const val SUPABASE_ANON_KEY = BuildConfig.SUPABASE_ANON_KEY
    
    // Use Android Keystore for sensitive data
    fun encryptSensitiveData(data: String): String {
        val keyAlias = "studio_booking_key"
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        
        // Implementation for encryption using Android Keystore
        // ... encryption logic
        return data // placeholder
    }
}

// Network Security
class NetworkSecurityInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        // Add security headers
        val secureRequest = request.newBuilder()
            .addHeader("X-Requested-With", "XMLHttpRequest")
            .addHeader("X-App-Version", BuildConfig.VERSION_NAME)
            .build()
        
        return chain.proceed(secureRequest)
    }
}
```

---

## Mobile-Specific Features

### Location Services
```kotlin
@Singleton
class LocationManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val fusedLocationClient: FusedLocationProviderClient
) {
    
    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): Location? {
        return suspendCancellableCoroutine { continuation ->
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    continuation.resume(location)
                }
                .addOnFailureListener { exception ->
                    continuation.resumeWithException(exception)
                }
        }
    }
    
    fun isLocationPermissionGranted(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
}
```

### Camera Integration
```kotlin
@Composable
fun CameraCapture(
    onImageCaptured: (Uri) -> Unit,
    onError: (Exception) -> Unit
) {
    val context = LocalContext.current
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            // Image captured successfully
        }
    }
    
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            val imageUri = createImageUri(context)
            cameraLauncher.launch(imageUri)
        }
    }
    
    Button(
        onClick = {
            when (PackageManager.PERMISSION_GRANTED) {
                ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.CAMERA
                ) -> {
                    val imageUri = createImageUri(context)
                    cameraLauncher.launch(imageUri)
                }
                else -> {
                    permissionLauncher.launch(Manifest.permission.CAMERA)
                }
            }
        }
    ) {
        Text("Take Photo")
    }
}

private fun createImageUri(context: Context): Uri {
    val image = File(context.filesDir, "camera_photo.png")
    return FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        image
    )
}
```

### Push Notifications
```kotlin
@Singleton
class NotificationManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val firebaseMessaging: FirebaseMessaging
) {
    
    suspend fun initializeNotifications() {
        createNotificationChannel()
        getFirebaseToken()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                BOOKING_CHANNEL_ID,
                "Booking Updates",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for booking updates"
                enableLights(true)
                lightColor = Color.BLUE
                enableVibration(true)
            }
            
            val notificationManager = context.getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private suspend fun getFirebaseToken(): String? {
        return try {
            firebaseMessaging.token.await()
        } catch (e: Exception) {
            null
        }
    }
    
    fun showBookingNotification(title: String, message: String, bookingId: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("booking_id", bookingId)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent, PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, BOOKING_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()
        
        NotificationManagerCompat.from(context).notify(Random.nextInt(), notification)
    }
    
    companion object {
        private const val BOOKING_CHANNEL_ID = "booking_updates"
    }
}
```

---

## Performance Optimization

### Caching Strategy
```kotlin
@Singleton
class CacheManager @Inject constructor(
    private val memoryCache: LruCache<String, Any>,
    private val diskCache: DiskLruCache,
    private val database: AppDatabase
) {
    
    suspend fun cacheStudios(studios: List<Studio>) {
        // Memory cache for immediate access
        studios.forEach { studio ->
            memoryCache.put("studio_${studio.id}", studio)
        }
        
        // Database cache for offline access
        database.studioDao().insertStudios(
            studios.map { it.toEntity() }
        )
    }
    
    suspend fun getCachedStudio(id: String): Studio? {
        // Check memory cache first
        memoryCache.get("studio_$id")?.let { cached ->
            return cached as Studio
        }
        
        // Check database cache
        return database.studioDao().getStudioById(id)?.toDomain()
    }
    
    suspend fun cacheImages(imageUrls: List<String>) {
        imageUrls.forEach { url ->
            // Pre-load images using Coil
            val imageRequest = ImageRequest.Builder(context)
                .data(url)
                .memoryCachePolicy(CachePolicy.ENABLED)
                .diskCachePolicy(CachePolicy.ENABLED)
                .build()
            
            imageLoader.execute(imageRequest)
        }
    }
}
```

### Image Optimization
```kotlin
@Composable
fun OptimizedAsyncImage(
    model: Any?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    placeholder: @Composable () -> Unit = { 
        Box(
            modifier = Modifier.fillMaxSize().background(Color.Gray.copy(alpha = 0.3f)),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }
) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(model)
            .crossfade(true)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .diskCachePolicy(CachePolicy.ENABLED)
            .build(),
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale,
        placeholder = { placeholder() },
        error = {
            Image(
                painter = painterResource(R.drawable.placeholder_studio),
                contentDescription = contentDescription,
                contentScale = contentScale
            )
        }
    )
}
```

### Background Processing
```kotlin
@HiltWorker
class DataSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val studioRepository: StudioRepository,
    private val bookingRepository: BookingRepository
) : CoroutineWorker(context, workerParams) {
    
    override suspend fun doWork(): Result {
        return try {
            // Sync studios data
            studioRepository.syncStudios()
            
            // Sync user bookings
            bookingRepository.syncUserBookings()
            
            // Clear old cache
            clearOldCache()
            
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    private suspend fun clearOldCache() {
        val cutoffTime = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(7)
        // Clear cache older than 7 days
    }
    
    @AssistedFactory
    interface Factory {
        fun create(context: Context, params: WorkerParameters): DataSyncWorker
    }
}
```

---

## Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/studiobooking/
│   │   │   ├── di/                 # Dependency Injection
│   │   │   │   ├── DatabaseModule.kt
│   │   │   │   ├── NetworkModule.kt
│   │   │   │   ├── RepositoryModule.kt
│   │   │   │   └── ViewModelModule.kt
│   │   │   │
│   │   │   ├── data/               # Data Layer
│   │   │   │   ├── local/          # Local Data Sources
│   │   │   │   │   ├── dao/
│   │   │   │   │   ├── entities/
│   │   │   │   │   └── database/
│   │   │   │   │
│   │   │   │   ├── remote/         # Remote Data Sources
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── mappers/
│   │   │   │   │
│   │   │   │   └── repositories/   # Repository Implementations
│   │   │   │
│   │   │   ├── domain/             # Domain Layer
│   │   │   │   ├── models/         # Domain Models
│   │   │   │   ├── repositories/   # Repository Interfaces
│   │   │   │   └── usecases/       # Use Cases
│   │   │   │
│   │   │   ├── presentation/       # Presentation Layer
│   │   │   │   ├── ui/
│   │   │   │   │   ├── components/ # Reusable Components
│   │   │   │   │   ├── screens/    # Screen Composables
│   │   │   │   │   └── theme/      # Theme Configuration
│   │   │   │   │
│   │   │   │   ├── viewmodels/     # ViewModels
│   │   │   │   └── navigation/     # Navigation
│   │   │   │
│   │   │   ├── utils/              # Utilities
│   │   │   │   ├── Constants.kt
│   │   │   │   ├── Extensions.kt
│   │   │   │   └── Validators.kt
│   │   │   │
│   │   │   └── StudioBookingApplication.kt
│   │   │
│   │   ├── res/                    # Resources
│   │   │   ├── drawable/
│   │   │   ├── mipmap/
│   │   │   ├── values/
│   │   │   └── xml/
│   │   │
│   │   └── AndroidManifest.xml
│   │
│   └── test/                       # Unit Tests
│       └── java/com/studiobooking/
│           ├── data/
│           ├── domain/
│           └── presentation/
│
├── build.gradle.kts
└── proguard-rules.pro
```

---

## Development Guidelines

### Code Quality Standards
```kotlin
// Ktlint configuration
tasks.named("check") {
    dependsOn("ktlintCheck")
}

// Detekt configuration
detekt {
    buildUponDefaultConfig = true
    allRules = false
    config = files("$projectDir/config/detekt.yml")
    
    reports {
        html.enabled = true
        xml.enabled = true
        txt.enabled = true
    }
}
```

### Testing Strategy
```kotlin
// Unit Tests Example
@Test
fun `getStudios should return cached data when offline`() = runTest {
    // Given
    val cachedStudios = listOf(mockStudio1, mockStudio2)
    coEvery { networkConnectivity.isConnected() } returns false
    coEvery { localDataSource.getCachedStudios() } returns cachedStudios
    
    // When
    val result = studioRepository.getStudios()
    
    // Then
    assertThat(result).isEqualTo(cachedStudios)
    coVerify { localDataSource.getCachedStudios() }
    coVerify(exactly = 0) { remoteDataSource.getStudios(any(), any(), any(), any()) }
}

// UI Tests Example
@Test
fun studioListDisplaysCorrectly() {
    composeTestRule.setContent {
        StudioListScreen(
            studios = mockStudios,
            onStudioClick = {},
            onFavoriteClick = {}
        )
    }
    
    composeTestRule.onNodeWithText(mockStudios.first().title).assertIsDisplayed()
    composeTestRule.onNodeWithText(mockStudios.first().location).assertIsDisplayed()
}
```

### Build Configuration
```kotlin
// app/build.gradle.kts
android {
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.studiobooking.android"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        buildConfigField("String", "SUPABASE_URL", "\"${project.findProperty("SUPABASE_URL")}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"${project.findProperty("SUPABASE_ANON_KEY")}\"")
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
        buildConfig = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    implementation("androidx.hilt:hilt-work:1.1.0")
    
    // Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Networking
    implementation("io.ktor:ktor-client-android:2.3.7")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.7")
    implementation("io.ktor:ktor-client-logging:2.3.7")
    
    // Supabase
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.4")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:2.0.4")
    implementation("io.github.jan-tennert.supabase:realtime-kt:2.0.4")
    implementation("io.github.jan-tennert.supabase:storage-kt:2.0.4")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Maps
    implementation("com.google.android.gms:play-services-maps:18.2.0")
    implementation("com.google.android.gms:play-services-location:21.0.1")
    implementation("com.google.maps.android:maps-compose:4.3.0")
    
    // Payments
    implementation("com.razorpay:checkout:1.6.33")
    
    // Work Manager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("androidx.hilt:hilt-work:1.1.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.48")
    
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

This comprehensive specification provides everything needed to build a premium native Android app for your studio booking platform. The app will share the same Supabase database while providing superior mobile performance, offline functionality, and native Android features.
