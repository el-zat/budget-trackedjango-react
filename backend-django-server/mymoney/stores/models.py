from django.db import models
from expenses.models import Category


class KnownStore(models.Model):
    """Known stores for automatic receipt categorization."""

    class StoreType(models.TextChoices):
        GROCERY = 'grocery', 'Grocery Store'
        DRUGSTORE = 'drugstore', 'Drugstore'
        GAS_STATION = 'gas_station', 'Gas Station'
        SPORTS = 'sports', 'Sports Store'
        ELECTRONICS = 'electronics', 'Electronics Store'
        CLOTHING = 'clothing', 'Clothing Store'
        PET = 'pet', 'Pet Store'
        HOME = 'home', 'Home Store'

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Canonical store name (e.g. Lidl)"
    )
    ocr_variants = models.TextField(
        help_text="Comma-separated OCR variations, lowercase (e.g. lidl, l.dl, lid1, lidl stiftung)"
    )
    category = models.ForeignKey(
        to=Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Category to auto-assign for receipts from this store"
    )
    group_label = models.CharField(
        max_length=100,
        default='Supermarket total',
        help_text="Label used as expense name (e.g. Supermarket total, Drugstore total)"
    )
    store_type = models.CharField(
        max_length=20,
        choices=StoreType.choices,
        default=StoreType.GROCERY,
        help_text="Type of store"
    )

    def get_variants_list(self):
        """Return list of OCR variants."""
        return [v.strip() for v in self.ocr_variants.split(',') if v.strip()]

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Known Store'
        verbose_name_plural = 'Known Stores'
        ordering = ['name']


class StoreTypeManager(models.Manager):
    store_type = None

    def get_queryset(self):
        return super().get_queryset().filter(store_type=self.store_type)


class GroceryStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.GROCERY


class DrugstoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.DRUGSTORE


class GasStationStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.GAS_STATION


class SportStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.SPORTS


class ElectronicsStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.ELECTRONICS


class ClothingStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.CLOTHING


class PetStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.PET


class HomeStoreManager(StoreTypeManager):
    store_type = KnownStore.StoreType.HOME


class GroceryStore(KnownStore):
    objects = GroceryStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Grocery Store'
        verbose_name_plural = 'Grocery Stores'


class Drugstore(KnownStore):
    objects = DrugstoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Drugstore'
        verbose_name_plural = 'Drugstores'


class GasStationStore(KnownStore):
    objects = GasStationStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Gas Station'
        verbose_name_plural = 'Gas Stations'


class SportStore(KnownStore):
    objects = SportStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Sport Store'
        verbose_name_plural = 'Sport Stores'


class ElectronicsStore(KnownStore):
    objects = ElectronicsStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Electronics Store'
        verbose_name_plural = 'Electronics Stores'


class ClothingStore(KnownStore):
    objects = ClothingStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Clothing Store'
        verbose_name_plural = 'Clothing Stores'


class PetStore(KnownStore):
    objects = PetStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Pet Store'
        verbose_name_plural = 'Pet Stores'


class HomeStore(KnownStore):
    objects = HomeStoreManager()

    class Meta:
        proxy = True
        verbose_name = 'Home Store'
        verbose_name_plural = 'Home Stores'
