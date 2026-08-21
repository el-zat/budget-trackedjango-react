from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0001_initial_known_stores'),
    ]

    operations = [
        migrations.RunPython(
            migrations.RunPython.noop,
            reverse_code=migrations.RunPython.noop,
        ),
    ]