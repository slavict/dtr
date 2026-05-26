from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('records', '0002_alter_user_username_not_unique'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='failed_login_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='locked_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
