import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required'],
      trim: true,
    },
    backdropUrl: {
      type: String,
      default: '',
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1888, 'Release year must be 1888 or later'],
      max: [2100, 'Release year cannot be in the distant future'],
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A movie must have at least one genre',
      },
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      trim: true,
      maxlength: [2000, 'Synopsis cannot exceed 2000 characters'],
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required'],
      min: [1, 'Runtime must be at least 1 minute'],
    },
    director: {
      type: String,
      required: [true, 'Director name is required'],
      trim: true,
    },
    cast: {
      type: [String],
      required: [true, 'At least one cast member is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A movie must have at least one cast member',
      },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug generation before save
movieSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + this.releaseYear;
  }
  next();
});

// Indexes for performance
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ averageRating: -1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ createdAt: -1 });

export const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
